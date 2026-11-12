import { ServerInfoWithFormulas } from "./modules/classes/ServerInfoWithFormulas";
import { getAllRootedTargetForHackingServerNames } from "./modules/server";
import { PathBuilder } from "./modules/classes/PathBuilder";

export async function main(ns: NS) {
  let serverNumber = 0;
  if (typeof ns.args[0] === "number") {
    serverNumber = ns.args[0] as number;
  }

  const servers: Array<string> = getAllRootedTargetForHackingServerNames(ns);

  for (let i = 0; i < servers.length; i++) {
    const server: string | undefined = servers[i];
    if (!server) {
      continue;
    }

    ns.kill(
      PathBuilder.remoteHandlers + "serverHandlerSimple.ts",
      "home",
      server,
    );
    ns.kill(
      PathBuilder.remoteHandlers + "serverHandlerSimple.ts",
      "CloudServer_24",
      server,
    );
    ns.kill(
      PathBuilder.remoteHandlers + "serverHandlerSimpleWithFormulas.ts",
      "home",
      server,
    );
    ns.kill(
      PathBuilder.remoteHandlers + "serverHandlerSimpleWithFormulas.ts",
      "CloudServer_24",
      server,
    );
  }

  if (serverNumber <= 0 || serverNumber > servers.length) {
    serverNumber = servers.length;
  }

  const serversInfo: Array<ServerInfoWithFormulas> =
    ServerInfoWithFormulas.getServersInfoWithFormulas(
      ns,
      getAllRootedTargetForHackingServerNames(ns),
    );
  //sort by diff
  serversInfo.sort(
    (a, b) => (a.server?.baseDifficulty ?? 0) - (b.server?.baseDifficulty ?? 0),
  );

  for (let i = 0; i < serverNumber; i++) {
    const server: string | undefined = serversInfo[i]?.name;
    if (!server) {
      continue;
    }

    if (
      !ns.isRunning(
        PathBuilder.remoteHandlers + "serverHandlerShotgun.ts",
        "CloudServer_24",
        server,
      )
    ) {
      ns.exec(
        PathBuilder.remoteHandlers + "serverHandlerShotgun.ts",
        "CloudServer_24",
        1,
        server,
      );
    }
  }
}
