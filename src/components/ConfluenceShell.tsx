"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthWidget from "./AuthWidget";
import styles from "./ConfluenceShell.module.css";

// Only these two go anywhere; the rest are inert filler so the sidebar reads
// like a normal long BRD list, same pattern as the real Confluence export.
export const CHESS_TITLE = "BRD 2026 051 OPS COG Enhancement Matrix Validasi Transaksi Tunai";
export const SUDOKU_TITLE = "BRD 2026 052 OPS COG Integrasi Modul Rekonsiliasi Harian";
export const WORDLE_TITLE = "BRD 2026 050 OPS COG Verifikasi Kode Referensi Harian";
export const POLYGONLE_TITLE = "BRD 2026 044 OPS COG Validasi Pola Simbol Transaksi";
export const WORD500_TITLE = "BRD 2026 045 OPS COG Audit Tersembunyi Kode Transaksi";
export const MINESWEEPER_TITLE = "BRD 2026 046 OPS COG Deteksi Dini Anomali Grid Transaksi";
export const TYPINGTEST_TITLE = "BRD 2026 047 OPS COG Pengukuran Kecepatan Input Operator";
export const LUDO_TITLE = "BRD 2024 MCR OPS 058 Simulasi Rute Distribusi Kas Antar Cabang";
export const KAKURO_TITLE = "BRD 2026 061 OPS COG Rekonsiliasi Silang Jumlah Nominal Cabang";

export const REAL_LINKS = [
  { href: "/", label: "2026 - Central Operation Group (COG)" },
  { href: "/chess", label: CHESS_TITLE },
  { href: "/sudoku", label: SUDOKU_TITLE },
  { href: "/wordle", label: WORDLE_TITLE },
  { href: "/polygonle", label: POLYGONLE_TITLE },
  { href: "/word500", label: WORD500_TITLE },
  { href: "/minesweeper", label: MINESWEEPER_TITLE },
  { href: "/typingtest", label: TYPINGTEST_TITLE },
  { href: "/ludo", label: LUDO_TITLE },
  { href: "/kakuro", label: KAKURO_TITLE },
];

export const DECORATIVE_TITLES = [
  "BRD 2026 048 OPS COG Enhancement SOR Kliring Kredit Incoming",
  "BRD 2026 049 OPS COG Enhancement Berita Acara Card Destruction",
  "BRD 2026 053 OPS COG RPA Auto Proceed Guarantee",
  "BRD 2026 054 OPS COG Payment Hub Outgoing Kliring Debet",
  "BRD 2026 055 OPS COG Self Optimizing Reconciliation ATM Bersama",
  "BRD 2026 056 OPS COG Migrasi Proses Pengisian Kas ATM/CRM",
  "BRD 2026 058 OPS COG Penutupan Channel BRIFAST Transaksi RTGS",
  "BRD 2026 059 OPS COG Update Stock Real Time Kartu di Uker",
  "BRD 2026 060 OPS COG Pengembangan Cash Smart System",
];

export default function ConfluenceShell({
  breadcrumb,
  title,
  meta,
  children,
}: {
  breadcrumb?: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>◆</span> Confluence
        </div>
        <nav className={styles.topnav}>
          <span>Spaces</span>
          <span>People</span>
          <span>Calendars</span>
          <span>Analytics</span>
        </nav>
        <input className={styles.search} placeholder="Search" readOnly />
        <AuthWidget />
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>2026 - Central Operation Group</div>
          {REAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.sidebarLink} ${
                pathname === link.href ? styles.sidebarLinkActive : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          {DECORATIVE_TITLES.map((t) => (
            <span key={t} className={styles.sidebarLink} style={{ cursor: "default" }}>
              {t}
            </span>
          ))}
        </aside>

        <main className={styles.main}>
          {breadcrumb && <div className={styles.breadcrumbs}>{breadcrumb}</div>}
          <h1 className={styles.title}>{title}</h1>
          {meta && <div className={styles.meta}>{meta}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
