import { getAllUnrootedServerNames, getAllRootedServerNames, rootServer } from "../modules/server"

export async function main(ns: NS) {
  let isDone: boolean = false;
  while (!isDone) {
    const unrooted: Array<string> = getAllUnrootedServerNames(ns);

    if (unrooted.length <= 0) {
      isDone = true;
      continue;
    }

    const rooted: Array<string> = getAllRootedServerNames(ns);

    const path: string = "remoteHandlers/serverHandlerPrimitive.ts";
    const ramCost: number = ns.getScriptRam(path, "home");

    for (let i = 0; i < rooted.length; i++) {
      const serverName: string = rooted[i];
      const isRunning: boolean = ns.isRunning(path, serverName, serverName);

      if (serverName === "home") {
        continue;
      }
      if (isRunning) {
        continue;
      }
      const ramFree: number = ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName);
      if (ramFree < ramCost) {
        continue;
      }

      ns.scp(path, serverName, "home");

      ns.exec(path, serverName, 1, serverName);
    }

    await ns.asleep(60000);
  }
}