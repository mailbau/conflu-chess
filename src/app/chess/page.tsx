import ConfluenceShell from "@/components/ConfluenceShell";
import ChessSetup from "@/components/ChessSetup";

export default function ChessPage() {
  return (
    <ConfluenceShell
      breadcrumb="Spaces / Game Night Space"
      title="Chess"
      meta="Created by Ismail, last updated just now · 1 min read"
    >
      <ChessSetup />
    </ConfluenceShell>
  );
}
