import ChessGamePageContent from "./ChessGamePageContent";

export const instant = false;

export default async function ChessGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChessGamePageContent id={id} />;
}
