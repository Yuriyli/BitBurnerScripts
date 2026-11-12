import { PathBuilder } from "./modules/classes/PathBuilder";
import { ServerInfo } from "./modules/classes/ServerInfo";
import { getAllRootedTargetForHackingServerNames } from "./modules/server";

export async function main(ns: NS) {
  let serverNumber = 0;
  if (typeof ns.args[0] === "number") {
    serverNumber = ns.args[0] as number;
  }

  const servers: Array<string> = getAllRootedTargetForHackingServerNames(ns);

  for (let i = 0; i < servers.length; i++) {
    ns.scriptKill(
      PathBuilder.remoteHandlers + "serverHandlerPrimitive.ts",
      "home",
    );
    ns.scriptKill(
      PathBuilder.remoteHandlers + "serverHandlerSimpleHome.ts",
      "home",
    );
    ns.scriptKill(
      PathBuilder.remoteHandlers + "serverHandlerSimpleWithFormulas.ts",
      "home",
    );
    ns.scriptKill(
      PathBuilder.remoteHandlers + "serverHandlerShotgun.ts",
      "home",
    );
  }

  if (serverNumber <= 0 || serverNumber > servers.length) {
    serverNumber = servers.length;
  }

  const serversInfo: Array<ServerInfo> = ServerInfo.getServersInfo(
    ns,
    getAllRootedTargetForHackingServerNames(ns),
  );
  //sort by diff
  serversInfo.sort(
    (a, b) => (a.server?.baseDifficulty ?? 0) - (b.server?.baseDifficulty ?? 0),
  );

  for (let i = 0; i < serverNumber; i++) {
    const server: string | undefined = serversInfo[i]?.name;

    if (
      !ns.isRunning(
        PathBuilder.remoteHandlers + "serverHandlerSimple.ts",
        "home",
        server,
      )
    ) {
      ns.exec(
        PathBuilder.remoteHandlers + "serverHandlerSimple.ts",
        "home",
        1,
        server,
      );
    }
  }
}
