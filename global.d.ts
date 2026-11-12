import { NS as _NS } from "NetscriptDefinitions";

declare global {
  type NS = _NS;

  // Manual interfaces/types imports, but no better solution for now
  type Server = import("./NetscriptDefinitions").Server;
  type Player = import("./NetscriptDefinitions").Player;
}
