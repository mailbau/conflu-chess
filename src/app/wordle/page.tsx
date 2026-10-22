import ConfluenceShell, { WORDLE_TITLE } from "@/components/ConfluenceShell";
import { DocControlTable, FillerIntro, FillerOutro } from "@/components/BrdFiller";
import WordleBoard from "@/components/WordleBoard";

export default function WordlePage() {
  return (
    <ConfluenceShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={WORDLE_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 22, 2026 · 7 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR MBD 003 Verifikasi Kode"
        projectName="Verifikasi Kode Referensi Harian"
        divisi="Central Operation Group"
        appName="Reference Code Verification Engine"
      />
      <FillerIntro section="verifikasi kode referensi harian" />

      <h2>4. Simulasi Verifikasi Kode (Lampiran Interaktif)</h2>
      <p>
        Bagian berikut merupakan simulasi interaktif untuk menebak kode
        referensi 5 digit dalam maksimal 6 percobaan, digunakan untuk menguji
        alur validasi kode harian.
      </p>
      <WordleBoard />

      <FillerOutro />
    </ConfluenceShell>
  );
}
