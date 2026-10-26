import { WORDLE_TITLE } from "@/components/ConfluenceShell";
import ThemedShell from "@/components/ThemedShell";
import { DocControlTable, FillerIntro, FillerOutro, DemoSection } from "@/components/BrdFiller";
import WordleBoard from "@/components/WordleBoard";

export default function WordlePage() {
  return (
    <ThemedShell
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

      <DemoSection
        heading="4. Simulasi Verifikasi Kode (Lampiran Interaktif)"
        description="Bagian berikut merupakan simulasi interaktif untuk menebak kode referensi 5 digit dalam maksimal 6 percobaan, digunakan untuk menguji alur validasi kode harian."
        postmanBlurb="Send a request to guess the daily 5-character reference code within 6 attempts and test the validation flow."
      >
        <WordleBoard />
      </DemoSection>

      <FillerOutro />
    </ThemedShell>
  );
}
