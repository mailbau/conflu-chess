import styles from "@/components/ConfluenceShell.module.css";

// Generic made-up BRD boilerplate, styled after a real Confluence doc control
// table, used to disguise the game pages as ordinary internal paperwork.
export function DocControlTable({
  docTitle,
  projectName,
  divisi,
  appName,
}: {
  docTitle: string;
  projectName: string;
  divisi: string;
  appName: string;
}) {
  return (
    <table className={styles.propsTable}>
      <tbody>
        <tr>
          <td colSpan={2} style={{ fontWeight: 700, textAlign: "center" }}>
            KENDALI DOKUMEN
          </td>
        </tr>
        <tr>
          <td>Versi Dokumen</td>
          <td>1.2</td>
        </tr>
        <tr>
          <td>Tanggal Pembuatan</td>
          <td>03 Sep 2026</td>
        </tr>
        <tr>
          <td>Nama Proyek</td>
          <td>{projectName}</td>
        </tr>
        <tr>
          <td>Divisi yang Mengusulkan</td>
          <td>{divisi}</td>
        </tr>
        <tr>
          <td>Sourcing TI</td>
          <td>Inhouse</td>
        </tr>
        <tr>
          <td>Nama Sistem Aplikasi TI</td>
          <td>{appName}</td>
        </tr>
        <tr>
          <td>Jenis Aktivitas Aplikasi</td>
          <td>Non Financial</td>
        </tr>
        <tr>
          <td>Dokumen Rujukan</td>
          <td>{docTitle}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function FillerIntro({ section }: { section: string }) {
  return (
    <>
      <p>
        Dokumen ini disusun sebagai bagian dari proses pendefinisian kebutuhan
        pada tahap discovery session, mengacu pada standar dokumentasi
        internal yang berlaku di lingkungan Divisi Operasional.
      </p>
      <h2>1. Latar Belakang</h2>
      <p>
        Dalam rangka mendukung efisiensi proses operasional, diperlukan
        penyesuaian pada modul {section} agar selaras dengan kebutuhan bisnis
        terkini serta ketentuan yang berlaku.
      </p>
      <h2>2. Tujuan</h2>
      <p>
        Dokumen ini bertujuan untuk mendefinisikan kebutuhan fungsional dan
        non-fungsional secara menyeluruh, sebagai acuan bagi tim pengembang
        dalam tahap perancangan dan implementasi sistem.
      </p>
      <h2>3. Ruang Lingkup</h2>
      <p>
        Ruang lingkup dokumen ini mencakup proses bisnis, aktor terkait, serta
        ketentuan validasi yang berlaku pada modul terkait. Perubahan di luar
        cakupan ini akan didokumentasikan secara terpisah.
      </p>
    </>
  );
}

export function FillerOutro() {
  return (
    <>
      <h2>9. Catatan Tambahan</h2>
      <p>
        Seluruh ketentuan pada dokumen ini bersifat sementara dan dapat
        berubah mengikuti hasil diskusi lanjutan dengan pemangku kepentingan
        terkait. Mohon mengacu pada versi terbaru dokumen ini sebelum memulai
        implementasi.
      </p>
    </>
  );
}
