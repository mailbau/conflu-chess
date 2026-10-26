import { MINESWEEPER_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import MinesweeperBoard from "@/components/MinesweeperBoard";

export default function MinesweeperPage() {
  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={MINESWEEPER_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 23, 2026 · 10 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR MBD 006 Deteksi Anomali"
        projectName="Deteksi Dini Anomali Grid Transaksi"
        divisi="Central Operation Group"
        appName="Grid Anomaly Detection Engine"
      />
      <FillerIntro section="deteksi dini anomali grid transaksi" />

      <DemoSection
        heading="4. Simulasi Deteksi Anomali (Lampiran Interaktif)"
        description="Bagian berikut mensimulasikan proses penelusuran grid transaksi untuk mengidentifikasi titik anomali tersembunyi berdasarkan indikator jumlah anomali di sekitar setiap sel."
        postmanBlurb="Send a request to sweep the transaction grid and locate hidden anomaly points based on each cell's neighboring anomaly count."
      >
        <MinesweeperBoard />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
