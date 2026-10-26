import { CHESS_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable } from "@/components/BrdFiller";
import ChessGame from "@/components/ChessGame";

export const instant = false;

export default async function ChessGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ThemedShell
      breadcrumb="Spaces / 2026 - Central Operation Group (COG) / Lampiran"
      title={`${CHESS_TITLE} - Lampiran Teknis`}
      meta="Created by Febrika Kusuma Pertiwi · 3 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR MBD 001 Matrix Validasi"
        projectName="Enhancement Matrix Validasi Transaksi Tunai"
        divisi="Central Operation Group"
        appName="Matrix Validation Engine"
      />
      <h2>4. Simulasi Matrix Validasi</h2>
      <p>
        Skenario pengujian berikut mensimulasikan interaksi dua aktor pada
        sistem secara langsung. Status sesi diperbarui otomatis.
      </p>
      <ChessGame gameId={id} />
    </ThemedShell>
  );
}
