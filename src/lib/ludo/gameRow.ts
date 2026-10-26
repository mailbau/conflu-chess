import type { LudoState } from "./types";

export type LudoGameRow = {
  id: string;
  host_player: string;
  status: "lobby" | "active" | "finished";
  state: LudoState;
  version: number;
  created_at: string;
};
