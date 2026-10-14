import { ServerInfo } from "./classes/ServerInfo.ts";

export function getAllServerNames(ns: NS): Array<string> {
  let result: Array<string> = ["home"];

  scanNewAndAddToResult("home")

  return result;

  function scanNewAndAddToResult(server: string) {
    const newServers = scanAndFilter(server);

    if (newServers.length === 0) {
      return;
    }

    result = result.concat(newServers);
    newServers.forEach(s => scanNewAndAddToResult(s))

  }

  function scanAndFilter(server: string): Array<string> {
    const scanResult = ns.scan(server);

    return scanResult.filter(s => !result.includes(s));
  }
}

export function getAllRootedServerNames(ns: NS): Array<string> {
  const servers = getAllServerNames(ns);
  return servers.filter(s => ns.hasRootAccess(s))
}

export function getAllRootedTargetForHackingServerNames(ns: NS): Array<string> {
  const servers = getAllServerNames(ns);
  return servers.filter(s => ns.hasRootAccess(s) && s !== "home" && ns.getServerMaxMoney(s) > 0);
}

export function getAllUnrootedServerNames(ns: NS): Array<string> {
  const servers = getAllServerNames(ns);
  return servers.filter(s => !ns.hasRootAccess(s))
}

export function getListOfAvailableHacks(ns: NS): Array<string> {
  const result: Array<string> = [];

  if (ns.fileExists("BruteSSH.exe", "home")) { result.push("BruteSSH.exe") }
  if (ns.fileExists("FTPCrack.exe", "home")) { result.push("FTPCrack.exe") }
  if (ns.fileExists("HTTPWorm.exe", "home")) { result.push("HTTPWorm.exe") }
  if (ns.fileExists("relaySMTP.exe", "home")) { result.push("relaySMTP.exe") }
  if (ns.fileExists("SQLInject.exe", "home")) { result.push("SQLInject.exe") }

  return result;
}

export function getAllHackableServers(ns: NS): Array<string> {
  const result: Array<string> = [];

  const unrootedServers = getAllUnrootedServerNames(ns);
  const listOfHacks = getListOfAvailableHacks(ns);
  const hackingLvl = ns.getHackingLevel();

  unrootedServers.forEach(s => {
    const sHackingReq: number = ns.getServerRequiredHackingLevel(s);
    if (sHackingReq > hackingLvl)
      return;

    const portsReq: number = ns.getServerNumPortsRequired(s);
    if (portsReq > listOfHacks.length)
      return;

    result.push(s);
  });

  return result;
}

export function rootServer(ns: NS, serverName: string): boolean {
  const availableHacks: Array<string> = getListOfAvailableHacks(ns);

  if (availableHacks.includes("BruteSSH.exe"))
    ns.brutessh(serverName);
  if (availableHacks.includes("FTPCrack.exe"))
    ns.ftpcrack(serverName);
  if (availableHacks.includes("HTTPWorm.exe"))
    ns.httpworm(serverName);
  if (availableHacks.includes("relaySMTP.exe"))
    ns.relaysmtp(serverName);
  if (availableHacks.includes("SQLInject.exe"))
    ns.sqlinject(serverName);

  const result: boolean = ns.nuke(serverName);

  if (result)
    ns.tprint(`Server ${serverName} rooted.`)
  else
    ns.tprint(`Server ${serverName} faild to root.`)

  return result;
}

export function installRemoteHandlers(ns: NS, target: string) {
  const list: Array<string> = ["remoteHandlers/weakenHandler.ts",
    "remoteHandlers/growHandler.ts", "remoteHandlers/hackHandler.ts"];

  ns.scp(list, target, "home");
}

export function runWeaken(ns: NS, host: string, target: string, threads: number = 1): number {
  return ns.exec("remoteHandlers/weakenHandler.ts", host, threads, target);
}

export function runGrow(ns: NS, host: string, target: string, threads: number = 1): number {
  return ns.exec("remoteHandlers/growHandler.ts", host, threads, target);
}

export function runHack(ns: NS, host: string, target: string, threads: number = 1): number {
  return ns.exec("remoteHandlers/hackHandler.ts", host, threads, target);
}

// export function getServerInfo(ns: NS, serverName: string): ServerInfo {
//   const weakenCost: number = ns.getScriptRam("remoteHandlers/weakenHandler.ts", "home");
//   const growCost: number = ns.getScriptRam("remoteHandlers/growHandler.ts", "home");
//   const hackCost: number = ns.getScriptRam("remoteHandlers/hackHandler.ts", "home");

//   return new ServerInfo(ns, ns.getServer(serverName), weakenCost, growCost, hackCost);
// }

// export function getServersInfo(ns: NS, servers: Array<string>): Array<ServerInfo> {
//   const result: Array<ServerInfo> = new Array<ServerInfo>();

//   for (let i = 0; i < servers.length; i++) {
//     result.push(getServerInfo(ns, servers[i]));
//   }

//   return result;
// }