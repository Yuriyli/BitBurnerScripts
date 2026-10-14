import { ServerInfo } from "./modules/classes/ServerInfo";

export async function main(ns: NS) {
  const target = ns.args[0] as string;

  if (!target) {
    ns.tprint("Argument [0] \"target\" required");
    return;
  }

  let scriptDelay = 200;
  if (typeof ns.args[1] === "number") {
    scriptDelay = ns.args[1] as number;
  }
  
  ns.disableLog("ALL");
  ns.ui.openTail();

  let repeatFlag: boolean = true;
  do {
    ns.clearLog();
    let textResult: string = "";

    const serverInfo: ServerInfo = ServerInfo.getServerInfo(ns, target);
    textResult += serverInfo.name + "\n";

    textResult += "Sec level: " + serverInfo.server.minDifficulty + ' | ' + serverInfo.server.hackDifficulty + "\n";

    textResult += "Money: " + ns.format.number(serverInfo.server.moneyMax ?? 0) + ' | '
      + ns.format.number(serverInfo.server.moneyAvailable ?? 0) + "\n";

    textResult += "WGH timings: " + serverInfo.weakenTime
      + ' | ' + serverInfo.growTime
      + ' | ' + serverInfo.hackTime + "\n";

    ns.print(textResult);
    await ns.sleep(scriptDelay);
  } while (repeatFlag);
}