import { WORD500_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import Word500Board from "@/components/Word500Board";

export default function Word500Page() {
  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={WORD500_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 22, 2026 · 8 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR MBD 005 Audit Tersembunyi"
        projectName="Audit Tersembunyi Kode Transaksi"
        divisi="Central Operation Group"
        appName="Hidden Code Audit Engine"
      />
      <FillerIntro section="audit tersembunyi kode transaksi" />

      <DemoSection
        heading="4. Simulasi Audit (Lampiran Interaktif)"
        description="Bagian berikut mensimulasikan proses audit kode transaksi 5 digit, di mana hasil pencocokan hanya ditampilkan dalam bentuk ringkasan jumlah, bukan posisi detail, untuk menguji ketelitian validator."
        postmanBlurb="Send a request to audit a 5-character transaction code, where the response only returns count summaries, not per-position detail."
      >
        <Word500Board />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
