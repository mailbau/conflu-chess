import { SUDOKU_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import SudokuBoard from "@/components/SudokuBoard";

export default function SudokuPage() {
  return (
    <ThemedShell
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

      <DemoSection
        heading="4. Matrix Rekonsiliasi (Lampiran Interaktif)"
        description="Bagian berikut merupakan grid validasi 9x9 yang digunakan untuk menguji konsistensi data rekonsiliasi harian berdasarkan tingkat kompleksitas kasus."
        postmanBlurb="Send a request with a selected difficulty to generate a 9x9 validation grid and test it live."
      >
        <SudokuBoard />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
