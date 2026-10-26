import { LUDO_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import LudoSetup from "@/components/ludo/LudoSetup";

export default function LudoPage() {
  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={LUDO_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 26, 2026 · 9 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR OPS 058 Simulasi Rute Distribusi"
        projectName="Simulasi Rute Distribusi Kas Antar Cabang"
        divisi="Central Operation Group"
        appName="Branch Cash Route Simulation Tool"
      />
      <FillerIntro section="simulasi rute distribusi kas antar cabang" />

      <DemoSection
        heading="4. Simulasi Rute Multi-Cabang (Lampiran Interaktif)"
        description="Bagian berikut mensimulasikan rute distribusi kas antar 2 sampai 4 cabang secara bersamaan untuk memperoleh baseline waktu tempuh dan titik rawan keterlambatan sebelum proses rollout sistem."
        postmanBlurb="Send a request to open a 2-4 player session and test the branch cash route simulation in real time."
      >
        <LudoSetup />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
