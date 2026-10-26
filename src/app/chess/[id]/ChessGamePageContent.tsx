"use client";

import { CHESS_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, DemoSection } from "@/components/BrdFiller";
import ChessGame from "@/components/ChessGame";
import { useTheme } from "@/lib/theme";

export default function ChessGamePageContent({ id }: { id: string }) {
  const { theme } = useTheme();
  const isPostman = theme === "postman";

  return (
    <ThemedShell
      breadcrumb={
        isPostman ? "Workspaces / COG Workspace / Live Request" : "Spaces / 2026 - Central Operation Group (COG) / Lampiran"
      }
      title={isPostman ? `${CHESS_TITLE} - Live Session` : `${CHESS_TITLE} - Lampiran Teknis`}
      meta="Created by Febrika Kusuma Pertiwi · 3 minute read"
    >
      <DocControlTable
        docTitle="BRD 2024 MCR MBD 001 Matrix Validasi"
        projectName="Enhancement Matrix Validasi Transaksi Tunai"
        divisi="Central Operation Group"
        appName="Matrix Validation Engine"
      />
      <DemoSection
        heading="4. Simulasi Matrix Validasi"
        description="Skenario pengujian berikut mensimulasikan interaksi dua aktor pada sistem secara langsung. Status sesi diperbarui otomatis."
        postmanBlurb="This session simulates a live two-party interaction. Response status updates automatically."
      >
        <ChessGame gameId={id} />
      </DemoSection>
    </ThemedShell>
  );
}
