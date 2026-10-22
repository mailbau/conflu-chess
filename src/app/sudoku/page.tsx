import ConfluenceShell, { SUDOKU_TITLE } from "@/components/ConfluenceShell";
import { DocControlTable, FillerIntro, FillerOutro } from "@/components/BrdFiller";
import SudokuBoard from "@/components/SudokuBoard";

export default function SudokuPage() {
  return (
    <ConfluenceShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={SUDOKU_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 22, 2026 · 9 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR MBD 002 Rekonsiliasi"
        projectName="Integrasi Modul Rekonsiliasi Harian"
        divisi="Central Operation Group"
        appName="Reconciliation Grid Engine"
      />
      <FillerIntro section="rekonsiliasi harian" />

      <h2>4. Matrix Rekonsiliasi (Lampiran Interaktif)</h2>
      <p>
        Bagian berikut merupakan grid validasi 9x9 yang digunakan untuk
        menguji konsistensi data rekonsiliasi harian berdasarkan tingkat
        kompleksitas kasus.
      </p>
      <SudokuBoard />

      <FillerOutro />
    </ConfluenceShell>
  );
}
