"use client";

import { useTheme } from "@/lib/theme";
import confluenceStyles from "@/components/ConfluenceShell.module.css";
import postmanStyles from "@/components/PostmanFiller.module.css";

// Confluence disguise: made-up BRD boilerplate styled after a real doc
// control table. Postman disguise: the same four facts reframed as request
// metadata, since a "document control" table makes no sense inside an API
// client -- each theme needs filler that actually fits its own paradigm.
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
  const { theme } = useTheme();

  if (theme === "postman") {
    return (
      <table className={postmanStyles.metaTable}>
        <tbody>
          <tr>
            <td colSpan={2} style={{ fontWeight: 700, textAlign: "center" }}>
              REQUEST METADATA
            </td>
          </tr>
          <tr>
            <td>Request Name</td>
            <td>{projectName}</td>
          </tr>
          <tr>
            <td>Collection</td>
            <td>2026 - COG Reconciliation APIs</td>
          </tr>
          <tr>
            <td>Owning Team</td>
            <td>{divisi}</td>
          </tr>
          <tr>
            <td>Service</td>
            <td>{appName}</td>
          </tr>
          <tr>
            <td>Environment</td>
            <td>Production</td>
          </tr>
          <tr>
            <td>Auth Type</td>
            <td>Bearer Token</td>
          </tr>
          <tr>
            <td>Reference Doc</td>
            <td>{docTitle}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className={confluenceStyles.propsTable}>
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
  const { theme } = useTheme();

  if (theme === "postman") {
    return (
      <div className={postmanStyles.docSection}>
        <p>
          This endpoint is part of the internal reconciliation toolkit covering{" "}
          {section}. Use the environment variable <code>{"{{base_url}}"}</code> to target
          staging or production.
        </p>
        <h3>Query Parameters</h3>
        <p>
          <span className={postmanStyles.paramLabel}>branch_id</span> (required) — the branch
          code to reconcile against.
          <br />
          <span className={postmanStyles.paramLabel}>as_of_date</span> (optional) — defaults to
          the current business date.
        </p>
        <h3>Example Request</h3>
        <div className={postmanStyles.codeBlock}>
          {`curl -X GET "{{base_url}}/v2/cog/reconcile" \\\n  -H "Authorization: Bearer {{token}}" \\\n  -d '{ "branch_id": "0452", "as_of_date": "2026-10-26" }'`}
        </div>
      </div>
    );
  }

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

// wraps the embedded game: Confluence gets a numbered "Lampiran Interaktif"
// section like the rest of the fake BRD; Postman gets a "Try it" block like
// a real request's example/test panel
export function DemoSection({
  heading,
  description,
  postmanBlurb,
  children,
}: {
  heading: string;
  description: string;
  postmanBlurb: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  if (theme === "postman") {
    return (
      <div className={postmanStyles.docSection}>
        <h3>Try it</h3>
        <p>{postmanBlurb}</p>
        {children}
      </div>
    );
  }

  return (
    <>
      <h2>{heading}</h2>
      <p>{description}</p>
      {children}
    </>
  );
}

export function FillerOutro() {
  const { theme } = useTheme();

  if (theme === "postman") {
    return (
      <div className={postmanStyles.docSection}>
        <h3>Example Response</h3>
        <div className={postmanStyles.codeBlock}>
          {`{\n  "status": "ok",\n  "branch_id": "0452",\n  "reconciled": true,\n  "generated_at": "2026-10-26T09:15:00Z"\n}`}
        </div>
        <h3>Notes</h3>
        <p>
          Response shape is subject to change pending the next collection sync. Pin a
          version via the <code>Accept-Version</code> header if you need stability.
        </p>
      </div>
    );
  }

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
