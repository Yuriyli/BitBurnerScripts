import { ServerInfoWithFormulas } from "./modules/classes/ServerInfoWithFormulas";
import { ServerInfo } from "./modules/classes/ServerInfo";
import { getAllRootedTargetForHackingServerNames } from "./modules/server";

export async function main(ns: NS) {
  let serverNumber = 0;
  if (typeof ns.args[0] === "number") {
    serverNumber = ns.args[0] as number;
  }

  const servers: Array<string> = getAllRootedTargetForHackingServerNames(ns);

  for (let i = 0; i < servers.length; i++) {
    const server: string = servers[i];

    ns.kill("remoteHandlers/serverHandlerSimple.ts", "home", server);
    ns.kill("remoteHandlers/serverHandlerSimple.ts", "CloudServer_24", server);
    ns.kill("remoteHandlers/serverHandlerSimpleWithFormulas.ts", "home", server);
    ns.kill("remoteHandlers/serverHandlerSimpleWithFormulas.ts", "CloudServer_24", server);

  }

  if (serverNumber <= 0 || serverNumber > servers.length) {
    serverNumber = servers.length
  }

  const serversInfo: Array<ServerInfoWithFormulas> = ServerInfoWithFormulas
    .getServersInfoWithFormulas(ns, getAllRootedTargetForHackingServerNames(ns));
  //sort by diff
  serversInfo.sort((a, b) => (a.server?.baseDifficulty ?? 0) - (b.server?.baseDifficulty ?? 0));

  for (let i = 0; i < serverNumber; i++) {
    const server: string = serversInfo[i].name;

    if (!ns.isRunning("remoteHandlers/serverHandlerShotgun.ts", "CloudServer_24", server)) {
      ns.exec("remoteHandlers/serverHandlerShotgun.ts", "CloudServer_24", 1, server);
    }
  }
}