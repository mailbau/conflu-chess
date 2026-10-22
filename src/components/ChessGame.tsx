"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { supabase } from "@/lib/supabase";
import { getPlayerId } from "@/lib/playerId";
import type { GameRow } from "@/lib/gameTypes";
import { playMoveSound, playCaptureSound, playGameOverSound } from "@/lib/sound";
import styles from "./ChessGame.module.css";

function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RESULT_LABEL: Record<string, string> = {
  "1-0": "White wins",
  "0-1": "Black wins",
  "1/2-1/2": "Draw",
};

export default function ChessGame({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<GameRow | null>(null);
  const [optimisticFen, setOptimisticFen] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // forces re-render for the live clock
  const playerId = useRef<string>("");
  const timeoutClaimed = useRef(false);
  const prevPgn = useRef<string | null>(null);
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    playerId.current = getPlayerId();
  }, []);

  // join (or reconnect to) the game, then fetch its current state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pid = getPlayerId();
      await fetch(`/api/games/${gameId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: pid }),
      });
      const { data } = await supabase.from("games").select("*").eq("id", gameId).single();
      if (!cancelled && data) {
        const row = data as GameRow;
        prevPgn.current = row.pgn;
        prevStatus.current = row.status;
        setGame(row);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  // realtime: pick up the opponent's moves and clock/status changes
  useEffect(() => {
    const channel = supabase
      .channel(`games:${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const row = payload.new as GameRow;
          if (prevPgn.current !== null && row.pgn !== prevPgn.current) {
            const newText = row.pgn.slice(prevPgn.current.length);
            if (newText.includes("x")) playCaptureSound();
            else playMoveSound();
          }
          if (prevStatus.current !== null && row.status === "finished" && prevStatus.current !== "finished") {
            playGameOverSound();
          }
          prevPgn.current = row.pgn;
          prevStatus.current = row.status;
          setGame(row);
          setOptimisticFen(null);
          timeoutClaimed.current = false;
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // tick every 250ms while a clock should be running, to animate the countdown
  useEffect(() => {
    if (!game || game.status !== "active" || !game.last_move_at) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [game?.status, game?.last_move_at]); // eslint-disable-line react-hooks/exhaustive-deps

  const myColor: "w" | "b" | null = useMemo(() => {
    if (!game) return null;
    if (game.white_player === playerId.current) return "w";
    if (game.black_player === playerId.current) return "b";
    return null;
  }, [game]);

  const turnColor = game ? (game.fen.split(" ")[1] as "w" | "b") : "w";

  const { whiteMs, blackMs } = useMemo(() => {
    if (!game) return { whiteMs: 0, blackMs: 0 };
    let w = game.white_ms;
    let b = game.black_ms;
    if (game.status === "active" && game.last_move_at) {
      const elapsed = Date.now() - new Date(game.last_move_at).getTime();
      if (turnColor === "w") w -= elapsed;
      else b -= elapsed;
    }
    return { whiteMs: Math.max(0, w), blackMs: Math.max(0, b) };
  }, [game, turnColor, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // claim a timeout the instant the opponent's visible clock hits zero
  useEffect(() => {
    if (!game || game.status !== "active" || !myColor || timeoutClaimed.current) return;
    const opponentMs = turnColor === "w" ? whiteMs : blackMs;
    if (turnColor !== myColor && opponentMs <= 0) {
      timeoutClaimed.current = true;
      fetch(`/api/games/${gameId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: playerId.current, action: "claim-timeout" }),
      });
    }
  }, [game, myColor, turnColor, whiteMs, blackMs, gameId]);

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!game || !targetSquare || !myColor || game.status !== "active") return false;
      if (turnColor !== myColor) return false;

      const chess = new Chess();
      chess.load(game.fen);
      let move;
      try {
        move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      } catch {
        return false;
      }
      if (!move) return false;

      setOptimisticFen(chess.fen());
      fetch(`/api/games/${gameId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: playerId.current,
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        }),
      }).then(async (res) => {
        if (!res.ok) {
          // server rejected it (stale state, out of time, etc): snap back
          const { data } = await supabase.from("games").select("*").eq("id", gameId).single();
          if (data) setGame(data as GameRow);
          setOptimisticFen(null);
        }
      });
      return true;
    },
    [game, myColor, turnColor, gameId]
  );

  async function sendAction(action: string) {
    await fetch(`/api/games/${gameId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: playerId.current, action }),
    });
  }

  const [copied, setCopied] = useState(false);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (no permission, insecure context): fall back to manual select
    }
  }

  if (!game) return <p>Loading…</p>;

  const waiting = game.status === "waiting";
  const link = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className={styles.wrap}>
      <div className={styles.boardCol}>
        <div
          className={`${styles.clock} ${turnColor === (myColor === "w" ? "b" : "w") ? styles.clockActive : ""}`}
        >
          <span>Opponent</span>
          <span
            className={`${styles.clockTime} ${(myColor === "w" ? blackMs : whiteMs) < 10000 ? styles.clockLow : ""}`}
          >
            {formatClock(myColor === "w" ? blackMs : whiteMs)}
          </span>
        </div>

        <Chessboard
          options={{
            position: optimisticFen ?? game.fen,
            onPieceDrop,
            boardOrientation: myColor === "b" ? "black" : "white",
            allowDragging: !!myColor && game.status === "active",
          }}
        />

        <div
          className={`${styles.clock} ${turnColor === (myColor ?? "w") ? styles.clockActive : ""}`}
        >
          <span>You</span>
          <span
            className={`${styles.clockTime} ${(myColor === "w" ? whiteMs : blackMs) < 10000 ? styles.clockLow : ""}`}
          >
            {formatClock(myColor === "w" ? whiteMs : blackMs)}
          </span>
        </div>
      </div>

      <div className={styles.sidebar}>
        {waiting && (
          <div className={styles.linkBox}>
            Waiting for opponent. Share this link:
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
            <button className={styles.copyButton} onClick={copyLink}>
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        )}

        {game.status === "finished" && (
          <div className={styles.gameOverBanner}>
            {game.result ? RESULT_LABEL[game.result] : "Game aborted"}
            {game.reason ? ` · ${game.reason}` : ""}
          </div>
        )}

        {!waiting && game.status === "active" && (
          <div className={styles.status}>
            {myColor ? `You are ${myColor === "w" ? "White" : "Black"}` : "Spectating"}
          </div>
        )}

        {game.draw_offer && game.draw_offer !== myColor && myColor && (
          <div className={styles.drawOffer}>
            Opponent offers a draw.
            <button onClick={() => sendAction("accept-draw")}>Accept</button>
            <button onClick={() => sendAction("decline-draw")}>Decline</button>
          </div>
        )}

        {myColor && game.status === "active" && (
          <div className={styles.actions}>
            {!game.last_move_at && <button onClick={() => sendAction("abort")}>Abort</button>}
            {game.draw_offer !== myColor && (
              <button onClick={() => sendAction("offer-draw")}>Offer draw</button>
            )}
            <button onClick={() => sendAction("resign")}>Resign</button>
          </div>
        )}
      </div>
    </div>
  );
}
