import ConfluenceShell from "@/components/ConfluenceShell";
import styles from "@/components/ConfluenceShell.module.css";

export default function Home() {
  return (
    <ConfluenceShell
      breadcrumb="Spaces / Game Night Space"
      title="Game Night Space : Overview"
      meta="Created by Ismail, last updated just now · 1 min read"
    >
      <table className={styles.propsTable}>
        <tbody>
          <tr>
            <td>Pages in this space</td>
            <td>
              <a href="/chess">Chess</a> · <a href="/sudoku">Sudoku</a>
            </td>
          </tr>
          <tr>
            <td>Status</td>
            <td>Under construction</td>
          </tr>
        </tbody>
      </table>
      <p>
        This space hosts a couple of embedded games, for now Chess and
        Sudoku. Pick a page from the sidebar to get started.
      </p>
    </ConfluenceShell>
  );
}
