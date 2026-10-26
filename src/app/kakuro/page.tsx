import { KAKURO_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import KakuroBoard from "@/components/KakuroBoard";

export default function KakuroPage() {
  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={KAKURO_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 26, 2026 · 11 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR OPS 061 Rekonsiliasi Silang"
        projectName="Rekonsiliasi Silang Jumlah Nominal Cabang"
        divisi="Central Operation Group"
        appName="Cross-Sum Reconciliation Grid Tool"
      />
      <FillerIntro section="rekonsiliasi silang jumlah nominal cabang" />

      <DemoSection
        heading="4. Simulasi Rekonsiliasi Grid (Lampiran Interaktif)"
        description="Bagian berikut mensimulasikan proses rekonsiliasi nominal pada grid baris dan kolom, di mana setiap deret harus menjumlahkan angka target tanpa duplikasi digit, sebelum proses rollout sistem."
        postmanBlurb="Send a request to reconcile nominal amounts across a row/column grid, where every line must sum to its target with no repeated digits."
      >
        <KakuroBoard />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
