import { ServerInfoWithFormulas } from "./modules/classes/ServerInfoWithFormulas";
import { ServerInfo } from "./modules/classes/ServerInfo";
import { getAllRootedTargetForHackingServerNames } from "./modules/server";
import { CloudServerInfo } from "./modules/classes/CloudServerInfo";

export async function main(ns: NS) {
  let scriptDelay = 1000;
  if (typeof ns.args[0] === "number") {
    scriptDelay = ns.args[0] as number;
  }

  ns.disableLog("ALL");
  ns.ui.openTail();

  let cycleFlag: boolean = true;
  do {
    ns.clearLog();
    let textResult: string = "№".padEnd(3) + "Name:".padEnd(18) + "Money:".padEnd(22) + "WGH timings".padEnd(25)
      + 'W'.padEnd(5) + ' | ' + 'G/W'.padStart(8).padEnd(13) + ' | ' + 'H/W'.padStart(8).padEnd(12)
      + '\n';

    let serversInfo: Array<ServerInfoWithFormulas> = ServerInfoWithFormulas
      .getServersInfoWithFormulas(ns, getAllRootedTargetForHackingServerNames(ns));
    //sort by diff
    serversInfo.sort((a, b) => (a.server?.baseDifficulty ?? 0) - (b.server?.baseDifficulty ?? 0));
    for (let i = 0; i < serversInfo.length; i++) {
      const serv: ServerInfoWithFormulas = serversInfo[i];
      textResult += (i + 1).toString().padEnd(3);
      textResult += serv.name.padEnd(18);

      textResult += ns.format.number(serv.server.moneyAvailable ?? 0).padEnd(9) + ' | '
        + ns.format.number(serv.server.moneyMax ?? 0).padEnd(10);

      textResult += (serv.weakenTime / 1000).toFixed(1).padEnd(6)
        + ' | ' + (serv.growTime / 1000).toFixed(1).padEnd(6)
        + ' | ' + (serv.hackTime / 1000).toFixed(1).padEnd(7)

      const { hacks, hackWeakens, grows, growWeakens } = serv.getWGHCycle();
      textResult +=
        serv.getCurrentToDoWeakens().toString().padEnd(5) + ' | '
        + grows.toString().padEnd(6) + '/' + growWeakens.toString().padStart(6) + ' | '
        + hacks.toString().padEnd(6) + '/' + hackWeakens.toString().padStart(6);

      textResult += '\n';
    }

    const cloudServersInfo = CloudServerInfo.getCloudServersInfo(ns);
    textResult += '\n';
    textResult += cloudServersInfo.totalWeakens + ' | ' + cloudServersInfo.totalGrows + ' | ' + cloudServersInfo.totalHacks
    textResult += '\n';

    ns.print(textResult);
    await ns.sleep(scriptDelay);
  } while (cycleFlag);

}

