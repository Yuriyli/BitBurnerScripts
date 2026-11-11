import { PathBuilder } from "./modules/classes/PathBuilder";

export async function main(ns: NS) {
  const list: Array<string> = [
    PathBuilder.modules + "server.ts",
    PathBuilder.classes + "CloudServerInfo.ts",
    PathBuilder.classes + "ServerInfo.ts",
    PathBuilder.classes + "ServerInfoWithFormulas.ts",
    PathBuilder.remoteHandlers + "serverHandlerSimple.ts",
    PathBuilder.remoteHandlers + "serverHandlerSimpleWithFormulas.ts",
    PathBuilder.remoteHandlers + "serverHandlerShotgun.ts",
  ];

  ns.scp(list, "CloudServer_24", "home");
}
