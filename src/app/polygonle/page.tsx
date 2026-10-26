import { POLYGONLE_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import PolygonleBoard from "@/components/PolygonleBoard";

export default function PolygonlePage() {
  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={POLYGONLE_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 22, 2026 · 6 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR MBD 004 Validasi Pola"
        projectName="Validasi Pola Simbol Transaksi"
        divisi="Central Operation Group"
        appName="Symbol Pattern Validation Engine"
      />
      <FillerIntro section="validasi pola simbol transaksi" />

      <DemoSection
        heading="4. Simulasi Validasi Pola (Lampiran Interaktif)"
        description="Bagian berikut mensimulasikan pencocokan pola simbol terhadap kode referensi tersembunyi, digunakan untuk menguji konsistensi mapping antara simbol dan karakter."
        postmanBlurb="Send a request to match symbol patterns against a hidden reference code and test the mapping consistency."
      >
        <PolygonleBoard />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
