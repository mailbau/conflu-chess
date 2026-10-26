"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthWidget from "./AuthWidget";
import { REAL_LINKS, DECORATIVE_TITLES } from "./ConfluenceShell";
import styles from "./PostmanShell.module.css";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const METHOD_CLASS: Record<string, string> = {
  GET: "methodGet",
  POST: "methodPost",
  PUT: "methodPut",
  PATCH: "methodPatch",
  DELETE: "methodDelete",
};

// deterministic per-link method + fake path, so it looks stable across renders
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function methodFor(key: string): string {
  return METHODS[hashCode(key) % METHODS.length];
}

function pathFor(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .split("-")
    .slice(0, 5)
    .join("-");
  return `/api/v2/cog/${slug}`;
}

export default function PostmanShell({
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
  const method = methodFor(title);
  const url = pathFor(title);

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>▲</span> Postman
        </div>
        <div className={styles.workspace}>COG Workspace</div>
        <input className={styles.search} placeholder="Search Postman" readOnly />
        <AuthWidget />
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Collections</div>
          <div className={styles.collectionName}>2026 - COG Reconciliation APIs</div>
          {REAL_LINKS.map((link) => {
            const m = methodFor(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.requestRow} ${pathname === link.href ? styles.requestRowActive : ""}`}
              >
                <span className={`${styles.methodBadge} ${styles[METHOD_CLASS[m]]}`}>{m}</span>
                <span className={styles.requestLabel}>{link.label}</span>
              </Link>
            );
          })}
          {DECORATIVE_TITLES.map((t) => {
            const m = methodFor(t);
            return (
              <span key={t} className={styles.requestRow} style={{ cursor: "default" }}>
                <span className={`${styles.methodBadge} ${styles[METHOD_CLASS[m]]}`}>{m}</span>
                <span className={styles.requestLabel}>{t}</span>
              </span>
            );
          })}
        </aside>

        <main className={styles.main}>
          <div className={styles.requestBar}>
            <span className={`${styles.methodBadge} ${styles.methodBadgeLarge} ${styles[METHOD_CLASS[method]]}`}>
              {method}
            </span>
            <input className={styles.urlInput} value={`{{base_url}}${url}`} readOnly />
            <button className={styles.sendButton} disabled>
              Send
            </button>
          </div>

          <div className={styles.tabs}>
            <span className={styles.tabActive}>Body</span>
            <span className={styles.tab}>Params</span>
            <span className={styles.tab}>Authorization</span>
            <span className={styles.tab}>Headers</span>
            <span className={styles.tab}>Scripts</span>
            <span className={styles.tab}>Settings</span>
          </div>

          <div className={styles.bodyTypeRow}>
            <span className={styles.bodyTypeActive}>raw</span>
            <span className={styles.bodyType}>JSON</span>
          </div>

          <div className={styles.panel}>
            {breadcrumb && <div className={styles.breadcrumbs}>{breadcrumb}</div>}
            <h1 className={styles.title}>{title}</h1>
            {meta && <div className={styles.meta}>{meta}</div>}
            {children}
          </div>

          <div className={styles.responseBar}>
            <span className={styles.statusOk}>● 200 OK</span>
            <span>Time: 128 ms</span>
            <span>Size: 1.4 KB</span>
          </div>
        </main>
      </div>
    </div>
  );
}
