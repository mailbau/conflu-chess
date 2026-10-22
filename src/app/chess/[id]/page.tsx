import ConfluenceShell from "@/components/ConfluenceShell";
import ChessGame from "@/components/ChessGame";

export const instant = false;

export default async function ChessGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ConfluenceShell
      breadcrumb="Spaces / Game Night Space / Chess"
      title="Chess : Live Game"
      meta="Created by Ismail · 1 min read"
    >
      <ChessGame gameId={id} />
    </ConfluenceShell>
  );
}
