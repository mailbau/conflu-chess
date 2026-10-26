import ConfluenceShell, { TYPINGTEST_TITLE } from "@/components/ConfluenceShell";
import { DocControlTable, FillerIntro, FillerOutro } from "@/components/BrdFiller";
import TypingTestBoard from "@/components/TypingTestBoard";

export default function TypingTestPage() {
  return (
    <ConfluenceShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={TYPINGTEST_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 26, 2026 · 8 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR OPR 007 Pengukuran Kecepatan Input"
        projectName="Pengukuran Kecepatan Input Operator"
        divisi="Central Operation Group"
        appName="Operator Input Speed Benchmark Tool"
      />
      <FillerIntro section="pengukuran kecepatan input operator" />

      <h2>4. Simulasi Benchmark Input (Lampiran Interaktif)</h2>
      <p>
        Bagian berikut mensimulasikan uji kecepatan input operator terhadap
        rangkaian teks acak guna memperoleh baseline kata per menit (KPM) dan
        tingkat akurasi pengetikan sebelum proses rollout sistem.
      </p>
      <TypingTestBoard />

      <FillerOutro />
    </ConfluenceShell>
  );
}
