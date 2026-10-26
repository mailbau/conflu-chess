import { WORD500_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro } from "@/components/BrdFiller";
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

      <h2>4. Simulasi Audit (Lampiran Interaktif)</h2>
      <p>
        Bagian berikut mensimulasikan proses audit kode transaksi 5 digit,
        di mana hasil pencocokan hanya ditampilkan dalam bentuk ringkasan
        jumlah, bukan posisi detail, untuk menguji ketelitian validator.
      </p>
      <Word500Board />

      <FillerOutro />
    </ThemedShell>
  );
}
