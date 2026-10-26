import ConfluenceShell, {
  CHESS_TITLE,
  SUDOKU_TITLE,
  WORDLE_TITLE,
  POLYGONLE_TITLE,
  WORD500_TITLE,
  MINESWEEPER_TITLE,
  TYPINGTEST_TITLE,
  LUDO_TITLE,
  KAKURO_TITLE,
} from "@/components/ConfluenceShell";
import styles from "@/components/ConfluenceShell.module.css";

export default function Home() {
  return (
    <ConfluenceShell
      breadcrumb="Spaces / Central Operation Group (COG)"
      title="2026 - Central Operation Group (COG)"
      meta="Created by Febrika Kusuma Pertiwi, last updated by Irmawira Shalihah on Oct 22, 2026 · 2 minute read"
    >
      <p>
        Space ini digunakan untuk mendokumentasikan Business Requirement
        Document (BRD) tahun 2026 pada lingkup Central Operation Group.
        Seluruh dokumen disusun mengikuti standar template internal dan wajib
        melalui proses review sebelum dipublikasikan.
      </p>

      <h2>Daftar Isi</h2>
      <table className={styles.propsTable}>
        <tbody>
          <tr>
            <td>No.</td>
            <td>Dokumen</td>
            <td>Keterangan</td>
          </tr>
          <tr>
            <td>1</td>
            <td>
              <a href="/chess">{CHESS_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Chess</td>
          </tr>
          <tr>
            <td>2</td>
            <td>
              <a href="/sudoku">{SUDOKU_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Sudoku</td>
          </tr>
          <tr>
            <td>3</td>
            <td>
              <a href="/wordle">{WORDLE_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Wordle</td>
          </tr>
          <tr>
            <td>4</td>
            <td>
              <a href="/polygonle">{POLYGONLE_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Polygonle</td>
          </tr>
          <tr>
            <td>5</td>
            <td>
              <a href="/word500">{WORD500_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Word500</td>
          </tr>
          <tr>
            <td>6</td>
            <td>
              <a href="/minesweeper">{MINESWEEPER_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Minesweeper</td>
          </tr>
          <tr>
            <td>7</td>
            <td>
              <a href="/typingtest">{TYPINGTEST_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Typing test</td>
          </tr>
          <tr>
            <td>8</td>
            <td>
              <a href="/ludo">{LUDO_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Ludo</td>
          </tr>
          <tr>
            <td>9</td>
            <td>
              <a href="/kakuro">{KAKURO_TITLE}</a>
            </td>
            <td className={styles.gameNote}>Kakuro</td>
          </tr>
        </tbody>
      </table>

      <h2>Petunjuk Penggunaan</h2>
      <p>
        1. Dokumen pada space ini dibuat pada tahap pendefinisian kebutuhan.
        <br />
        2. Dokumen dibuat secara berkolaborasi menggunakan tool Confluence.
        <br />
        3. Setiap task terkait tahap pendefinisian kebutuhan agar dibuat dan
        selalu diperbarui pada tool Confluence.
      </p>
    </ConfluenceShell>
  );
}
