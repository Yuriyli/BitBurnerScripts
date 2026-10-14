export async function main(ns: NS) {
  const list: Array<string> = ["modules/server.ts",
    "modules/classes/CloudServerInfo.ts", "modules/classes/ServerInfo.ts", "modules/classes/ServerInfoWithFormulas.ts",
    "remoteHandlers/serverHandlerSimple.ts", "remoteHandlers/serverHandlerSimpleWithFormulas.ts",
    "remoteHandlers/serverHandlerShotgun.ts"];

  ns.scp(list, "CloudServer_24", "home");
}