"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getPlayerId } from "@/lib/playerId";
import type { LudoGameRow } from "@/lib/ludo/gameRow";
import { TURN_TIMEOUT_MS } from "@/lib/ludo/types";
import { playMoveSound, playCaptureSound, playGameOverSound } from "@/lib/sound";
import { submitScore } from "@/lib/submitScore";
import LudoBoard from "./LudoBoard";
import styles from "./LudoGame.module.css";

export default function LudoGame({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<LudoGameRow | null>(null);
  const [name, setName] = useState("");
  const [tick, setTick] = useState(0);
  const [rollingFace, setRollingFace] = useState<number | null>(null);
  const playerId = useRef<string>("");
  const prevLogLen = useRef<number>(0);
  const timeoutClaimed = useRef(false);
  const rollAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    playerId.current = getPlayerId();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("ludo_games").select("*").eq("id", gameId).single();
      if (!cancelled && data) {
        const row = data as LudoGameRow;
        prevLogLen.current = row.state.log.length;
        setGame(row);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  useEffect(() => {
    const channel = supabase
      .channel(`ludo_games:${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ludo_games", filter: `id=eq.${gameId}` },
        (payload) => {
          const row = payload.new as LudoGameRow;
          const newLines = row.state.log.slice(prevLogLen.current);
          if (newLines.some((l) => l.includes("wins!"))) {
            playGameOverSound();
            if (row.state.phase.kind === "finished" && row.state.phase.winner === playerId.current) {
              submitScore("ludo", "wins", 1);
            }
          } else if (newLines.some((l) => l.includes("sent") && l.includes("home"))) playCaptureSound();
          else if (newLines.length > 0) playMoveSound();
          prevLogLen.current = row.state.log.length;
          timeoutClaimed.current = false;
          setGame(row);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // re-render every second to keep the timer bar live
  useEffect(() => {
    if (!game || game.state.phase.kind === "lobby" || game.state.phase.kind === "finished") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [game?.state.phase.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const me = useMemo(
    () => game?.state.players.find((p) => p.id === playerId.current) ?? null,
    [game]
  );

  const elapsedMs = game ? Date.now() - new Date(game.state.turnStartedAt).getTime() : 0;
  const timeLeftMs = Math.max(0, TURN_TIMEOUT_MS - elapsedMs);

  // claim the timeout the instant the bar runs out, from any connected client
  useEffect(() => {
    if (!game || timeoutClaimed.current) return;
    if (game.state.phase.kind !== "roll" && game.state.phase.kind !== "move") return;
    if (timeLeftMs > 0) return;
    timeoutClaimed.current = true;
    sendAction({ type: "claimTimeout" });
  }, [game, timeLeftMs]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendAction(action: unknown) {
    await fetch(`/api/ludo/${gameId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: playerId.current, action }),
    });
  }

  function rollDice() {
    if (rollAnimRef.current) return; // already rolling
    setRollingFace(Math.ceil(Math.random() * 6));
    rollAnimRef.current = setInterval(() => {
      setRollingFace(Math.ceil(Math.random() * 6));
    }, 80);
    sendAction({ type: "roll" });
    setTimeout(() => {
      if (rollAnimRef.current) clearInterval(rollAnimRef.current);
      rollAnimRef.current = null;
      setRollingFace(null);
    }, 600);
  }

  useEffect(() => {
    return () => {
      if (rollAnimRef.current) clearInterval(rollAnimRef.current);
    };
  }, []);

  async function join() {
    if (!name.trim()) return;
    await sendAction({ type: "join", name: name.trim() });
  }

  const [copied, setCopied] = useState(false);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: the link input is still there to select manually
    }
  }

  if (!game) return <p>Loading…</p>;

  const { state } = game;
  const link = typeof window !== "undefined" ? window.location.href : "";

  if (state.phase.kind === "lobby") {
    if (!me) {
      return (
        <div className={styles.joinBox}>
          <div className={styles.label}>Your name</div>
          <input
            className={styles.nameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="e.g. Bob"
          />
          <button className={styles.actionButton} onClick={join} disabled={state.players.length >= 4}>
            {state.players.length >= 4 ? "Game is full" : "Join game"}
          </button>
        </div>
      );
    }

    const isHost = state.players[0]?.id === playerId.current;
    return (
      <div className={styles.lobby}>
        <div className={styles.linkBox}>
          Share this link:
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <button className={styles.copyButton} onClick={copyLink}>
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
        <div className={styles.playerList}>
          {state.players.map((p) => (
            <div key={p.id} className={styles.playerRow}>
              <span className={styles.colorDot} style={{ background: dotColor(p.color) }} />
              {p.name} {p.id === state.players[0].id ? "(host)" : ""}
            </div>
          ))}
        </div>
        {isHost ? (
          <button
            className={styles.actionButton}
            onClick={() => sendAction({ type: "start" })}
            disabled={state.players.length < 2}
          >
            {state.players.length < 2 ? "Need at least 2 players" : "Start game"}
          </button>
        ) : (
          <div className={styles.status}>Waiting for the host to start…</div>
        )}
      </div>
    );
  }

  const myColor = me?.color ?? null;
  const currentPlayer = state.players[state.current];
  const isMyTurn = currentPlayer?.id === playerId.current;
  const timerPct = Math.round((timeLeftMs / TURN_TIMEOUT_MS) * 100);

  return (
    <div className={styles.wrap}>
      <div className={styles.boardCol}>
        <LudoBoard
          state={state}
          myColor={myColor}
          onMoveToken={(token) => sendAction({ type: "move", token })}
        />
      </div>

      <div className={styles.sidebar}>
        {state.phase.kind === "finished" ? (
          <div className={styles.banner}>
            {(() => {
              const winnerId = state.phase.kind === "finished" ? state.phase.winner : null;
              return state.players.find((p) => p.id === winnerId)?.name ?? "Someone";
            })()}{" "}
            wins!
          </div>
        ) : (
          <>
            <div className={styles.turnInfo}>
              <span className={styles.colorDot} style={{ background: dotColor(currentPlayer.color) }} />
              {isMyTurn ? "Your turn" : `${currentPlayer.name}'s turn`}
              {rollingFace !== null ? (
                <span className={`${styles.diceFace} ${styles.diceRolling}`}> 🎲 {rollingFace}</span>
              ) : (
                state.lastRoll && <span className={styles.diceFace}> 🎲 {state.lastRoll}</span>
              )}
            </div>
            <div className={styles.timerTrack} key={tick}>
              <div className={styles.timerFill} style={{ width: `${timerPct}%` }} />
            </div>
            {isMyTurn && state.phase.kind === "roll" && (
              <button
                className={styles.actionButton}
                onClick={rollDice}
                disabled={rollingFace !== null}
              >
                {rollingFace !== null ? "Rolling…" : "Roll dice"}
              </button>
            )}
            {isMyTurn && state.phase.kind === "move" && (
              <div className={styles.status}>Click a highlighted token to move it</div>
            )}
            {!isMyTurn && <div className={styles.status}>Waiting for {currentPlayer.name}…</div>}
          </>
        )}

        <div className={styles.playerList}>
          {state.players.map((p) => (
            <div key={p.id} className={styles.playerRow}>
              <span className={styles.colorDot} style={{ background: dotColor(p.color) }} />
              {p.name}
              <span className={styles.tokenSummary}>
                {p.tokens.filter((t) => t === 56).length}/4 home
              </span>
            </div>
          ))}
        </div>

        <div className={styles.log}>
          {state.log.slice(-8).map((line, i) => (
            <div key={i} className={styles.logLine}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function dotColor(color: string) {
  return { red: "#e06c75", green: "#7ee2a0", yellow: "#e8c468", blue: "#61afef" }[color] ?? "#888";
}
