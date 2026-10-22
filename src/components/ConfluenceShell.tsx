"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ConfluenceShell.module.css";

const SIDEBAR_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/chess", label: "Chess" },
  { href: "/sudoku", label: "Sudoku" },
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
          <span className={styles.logoMark}>◆</span> Camplue
        </div>
        <nav className={styles.topnav}>
          <span>Spaces</span>
          <span>People</span>
          <span>Create</span>
        </nav>
        <input className={styles.search} placeholder="Search" readOnly />
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Game Night Space</div>
          {SIDEBAR_LINKS.map((link) => (
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
