import ConfluenceShell from "@/components/ConfluenceShell";
import SudokuBoard from "@/components/SudokuBoard";

export default function SudokuPage() {
  return (
    <ConfluenceShell
      breadcrumb="Spaces / Game Night Space"
      title="Sudoku"
      meta="Created by Ismail, last updated just now · 1 min read"
    >
      <SudokuBoard />
    </ConfluenceShell>
  );
}
