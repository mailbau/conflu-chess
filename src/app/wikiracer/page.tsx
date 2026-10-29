import { WIKIRACER_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import WikiRaceBoard from "@/components/WikiRaceBoard";

export default function WikiRacerPage() {
  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG)"
      title={WIKIRACER_TITLE}
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 29, 2026 · 8 minute read"
    >
      <DocControlTable
        docTitle="BRD 2026 062 OPS COG Penelusuran Rantai Referensi"
        projectName="Penelusuran Rantai Referensi Dokumen Internal"
        divisi="Central Operation Group"
        appName="Document Reference Chain Tracer"
      />
      <FillerIntro section="penelusuran rantai referensi dokumen internal" />

      <DemoSection
        heading="4. Simulasi Penelusuran Rantai Referensi (Lampiran Interaktif)"
        description="Bagian berikut mensimulasikan proses penelusuran rantai referensi antar dokumen, di mana pengguna harus berpindah dari dokumen awal ke dokumen tujuan hanya melalui tautan referensi, untuk mengukur efisiensi navigasi sebelum proses rollout sistem."
        postmanBlurb="Trace a chain of references from a source document to a target document, following only reference links, to measure navigation efficiency."
      >
        <WikiRaceBoard />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
