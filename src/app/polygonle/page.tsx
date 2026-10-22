import ConfluenceShell, { POLYGONLE_TITLE } from "@/components/ConfluenceShell";
import { DocControlTable, FillerIntro, FillerOutro } from "@/components/BrdFiller";
import PolygonleBoard from "@/components/PolygonleBoard";

export default function PolygonlePage() {
  return (
    <ConfluenceShell
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

      <h2>4. Simulasi Validasi Pola (Lampiran Interaktif)</h2>
      <p>
        Bagian berikut mensimulasikan pencocokan pola simbol terhadap kode
        referensi tersembunyi, digunakan untuk menguji konsistensi mapping
        antara simbol dan karakter.
      </p>
      <PolygonleBoard />

      <FillerOutro />
    </ConfluenceShell>
  );
}
