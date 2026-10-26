import { LUDO_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro } from "@/components/BrdFiller";
import LudoGame from "@/components/ludo/LudoGame";

export const instant = false;

export default async function LudoGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

      <h2>4. Simulasi Rute Multi-Cabang (Lampiran Interaktif)</h2>
      <LudoGame gameId={id} />

      <FillerOutro />
    </ThemedShell>
  );
}
