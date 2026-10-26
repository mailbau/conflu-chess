import ConfluenceShell, { LUDO_TITLE } from "@/components/ConfluenceShell";
import { DocControlTable, FillerIntro, FillerOutro } from "@/components/BrdFiller";
import LudoSetup from "@/components/ludo/LudoSetup";

export default function LudoPage() {
  return (
    <ConfluenceShell
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
      <p>
        Bagian berikut mensimulasikan rute distribusi kas antar 2 sampai 4
        cabang secara bersamaan untuk memperoleh baseline waktu tempuh dan
        titik rawan keterlambatan sebelum proses rollout sistem.
      </p>
      <LudoSetup />

      <FillerOutro />
    </ConfluenceShell>
  );
}
