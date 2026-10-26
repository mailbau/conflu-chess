import { MINESWEEPER_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro } from "@/components/BrdFiller";
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

      <h2>4. Simulasi Deteksi Anomali (Lampiran Interaktif)</h2>
      <p>
        Bagian berikut mensimulasikan proses penelusuran grid transaksi untuk
        mengidentifikasi titik anomali tersembunyi berdasarkan indikator
        jumlah anomali di sekitar setiap sel.
      </p>
      <MinesweeperBoard />

      <FillerOutro />
    </ThemedShell>
  );
}
