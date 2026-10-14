import { ServerInfo } from "./modules/classes/ServerInfo";
import { getAllRootedTargetForHackingServerNames } from "./modules/server";
import { CloudServerInfo } from "./modules/classes/CloudServerInfo";

export async function main(ns: NS) {
  let scriptDelay = 1000;
  if (typeof ns.args[0] === "number") {
    scriptDelay = ns.args[1] as number;
  }

  ns.disableLog("ALL");
  ns.ui.openTail();

  let cycleFlag: boolean = true;
  do {
    ns.clearLog();
    let textResult: string = "Name:".padEnd(18) + "Money:".padEnd(22) + "WGH timings".padEnd(25)
      + 'W'.padEnd(5) + ' | ' + 'G/W'.padStart(8).padEnd(13) + ' | ' + 'H/W'.padStart(8).padEnd(12)
      + '\n';

    const serversInfo: Array<ServerInfo> = ServerInfo.getServersInfo(ns, getAllRootedTargetForHackingServerNames(ns));
    //sort by diff
    serversInfo.sort((a, b) => (a.server?.baseDifficulty ?? 0) - (b.server?.baseDifficulty ?? 0));
    for (let i = 0; i < serversInfo.length; i++) {
      const serv: ServerInfo = serversInfo[i];
      textResult += serv.name.padEnd(18);

      textResult += ns.format.number(serv.server.moneyAvailable ?? 0).padEnd(9) + ' | '
        + ns.format.number(serv.server.moneyMax ?? 0).padEnd(10);

      textResult += (serv.weakenTime / 1000).toFixed(1).padEnd(6)
        + ' | ' + (serv.growTime / 1000).toFixed(1).padEnd(6)
        + ' | ' + (serv.hackTime / 1000).toFixed(1).padEnd(7)

      const toDoGrowsResult = serv.getCurrentToDoGrows();
      const grows: number = toDoGrowsResult?.growsThreads ?? 0;
      const growsW: number = ServerInfo.getToDoWeakens(toDoGrowsResult?.secLevelRise ?? 0);
      const toDoHacksResult = serv.getCurrentToDoHacks();
      const hacks: number = toDoHacksResult?.hackThreads ?? 0;
      const hacksW: number = ServerInfo.getToDoWeakens(toDoHacksResult?.secLevelRise ?? 0);
      textResult +=
        serv.getCurrentToDoWeakens().toString().padEnd(5) + ' | '
        + grows.toString().padEnd(6) + '/' + growsW.toString().padStart(6) + ' | '
        + hacks.toString().padEnd(6) + '/' + hacksW.toString().padStart(6);

      textResult += '\n';
    }

    const cloudServersInfo = CloudServerInfo.getCloudServersInfo(ns);
    textResult += cloudServersInfo.totalWeakens + ' | ' + cloudServersInfo.totalGrows + ' | ' + cloudServersInfo.totalHacks
    textResult += '\n';

    ns.print(textResult);
    await ns.sleep(scriptDelay);
  } while (cycleFlag);

}

