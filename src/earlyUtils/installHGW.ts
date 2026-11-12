import { PathBuilder } from "../modules/classes/PathBuilder";

export async function main(ns: NS) {
  const list: Array<string> = [
    PathBuilder.remoteHandlers + "hackHandler.ts",
    PathBuilder.remoteHandlers + "growHandler.ts",
    PathBuilder.remoteHandlers + "weakenHandler.ts",
  ];

  const servers: Array<string> = ns.cloud.getServerNames();
  servers.forEach((name) => {
    ns.scp(list, name, "home");
  });
}
