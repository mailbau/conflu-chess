"use client";

import {
  CHESS_TITLE,
  SUDOKU_TITLE,
  WORDLE_TITLE,
  POLYGONLE_TITLE,
  WORD500_TITLE,
  MINESWEEPER_TITLE,
  TYPINGTEST_TITLE,
  LUDO_TITLE,
  KAKURO_TITLE,
  WIKIRACER_TITLE,
} from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { useTheme } from "@/lib/theme";
import confluenceStyles from "@/components/ConfluenceShell.module.css";
import postmanStyles from "@/components/PostmanFiller.module.css";

const ENTRIES = [
  { href: "/chess", title: CHESS_TITLE, game: "Chess" },
  { href: "/sudoku", title: SUDOKU_TITLE, game: "Sudoku" },
  { href: "/wordle", title: WORDLE_TITLE, game: "Wordle" },
  { href: "/polygonle", title: POLYGONLE_TITLE, game: "Polygonle" },
  { href: "/word500", title: WORD500_TITLE, game: "Word500" },
  { href: "/minesweeper", title: MINESWEEPER_TITLE, game: "Minesweeper" },
  { href: "/typingtest", title: TYPINGTEST_TITLE, game: "Typing test" },
  { href: "/ludo", title: LUDO_TITLE, game: "Ludo" },
  { href: "/kakuro", title: KAKURO_TITLE, game: "Kakuro" },
  { href: "/wikiracer", title: WIKIRACER_TITLE, game: "Wiki race" },
];

export default function Home() {
  const { theme } = useTheme();

  if (theme === "postman") {
    return (
      <ThemedShell
        breadcrumb="Workspaces / COG Workspace"
        title="2026 - COG Reconciliation APIs"
        meta="Collection · 9 requests · last synced by Irmawira Shalihah on Oct 22, 2026"
      >
        <p>
          This collection covers the internal reconciliation and validation
          endpoints maintained by Central Operation Group. Every request below
          targets the shared <code>{"{{base_url}}"}</code> environment variable.
        </p>

        <h3>Requests</h3>
        <table className={postmanStyles.metaTable}>
          <tbody>
            <tr>
              <td>No.</td>
              <td>Request</td>
            </tr>
            {ENTRIES.map((e, i) => (
              <tr key={e.href}>
                <td>{i + 1}</td>
                <td>
                  <a href={e.href}>{e.title}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Usage Notes</h3>
        <p>
          1. Requests in this collection are synced from the shared team workspace.
          <br />
          2. Changes to request bodies are tracked via collection version history.
          <br />
          3. Run the collection with the Collection Runner to validate all endpoints at once.
        </p>
      </ThemedShell>
    );
  }

  return (
    <ThemedShell
      breadcrumb="Spaces / Central Operation Group (COG)"
      title="2026 - Central Operation Group (COG)"
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 22, 2026 · 2 minute read"
    >
      <p>
        Space ini digunakan untuk mendokumentasikan Business Requirement
        Document (BRD) tahun 2026 pada lingkup Central Operation Group.
        Seluruh dokumen disusun mengikuti standar template internal dan wajib
        melalui proses review sebelum dipublikasikan.
      </p>

      <h2>Daftar Isi</h2>
      <table className={confluenceStyles.propsTable}>
        <tbody>
          <tr>
            <td>No.</td>
            <td>Dokumen</td>
            <td>Keterangan</td>
          </tr>
          {ENTRIES.map((e, i) => (
            <tr key={e.href}>
              <td>{i + 1}</td>
              <td>
                <a href={e.href}>{e.title}</a>
              </td>
              <td className={confluenceStyles.gameNote}>{e.game}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Petunjuk Penggunaan</h2>
      <p>
        1. Dokumen pada space ini dibuat pada tahap pendefinisian kebutuhan.
        <br />
        2. Dokumen dibuat secara berkolaborasi menggunakan tool Confluence.
        <br />
        3. Setiap task terkait tahap pendefinisian kebutuhan agar dibuat dan
        selalu diperbarui pada tool Confluence.
      </p>
    </ThemedShell>
  );
}
