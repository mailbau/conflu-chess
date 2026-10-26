import { CHESS_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import ChessSetup from "@/components/ChessSetup";

export default function ChessPage() {
  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={CHESS_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 22, 2026 · 12 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR MBD 001 Matrix Validasi"
        projectName="Enhancement Matrix Validasi Transaksi Tunai"
        divisi="Central Operation Group"
        appName="Matrix Validation Engine"
      />
      <FillerIntro section="validasi transaksi tunai" />

      <DemoSection
        heading="4. Matrix Validasi (Lampiran Interaktif)"
        description="Bagian berikut merupakan simulasi interaktif dari matrix validasi yang digunakan untuk menguji skenario transaksi secara real-time antara dua pihak terkait."
        postmanBlurb="Send a request to open a live two-player session. Share the generated challenge link with the other party to test the real-time validation flow."
      >
        <ChessSetup />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
