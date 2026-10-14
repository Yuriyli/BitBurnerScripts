import { CloudServerInfo } from "../modules/classes/CloudServerInfo";
import { ServerInfo } from "../modules/classes/ServerInfo";

export async function main(ns: NS) {
  const target = ns.args[0] as string;

  if (!target) {
    ns.tprint("Argument [0] \"target\" required");
    return;
  }

  const scriptDelay = 50;

  let serverInfo: ServerInfo = ServerInfo.getServerInfo(ns, target);
  let cloudServersInfoList: Array<CloudServerInfo> = CloudServerInfo.getCloudServersInfoRaw(ns);

  // Kill all runing scripts on cloud servers. Requested after reboot.
  CloudServerInfo.killAllWGHByTargetName(cloudServersInfoList, target);

  // Needed because on low money PrepareServer() can calculate wrong grow count. 
  do {
    await PrepareServer();
    updateServerInfo();
  } while (!serverInfo.serverIsPrepared);

  await hackCycle();

  async function PrepareServer() {
    let toDoWeakens: number = 0;
    let toDoGrows: number = 0;

    // 1. Weaken to 0
    do {
      updateServerInfo(); // not optimal but simple.
      toDoWeakens = serverInfo.getCurrentToDoWeakens();
      if (toDoWeakens === 0) {
        break;
      }
      const weakenT: number = serverInfo.weakenTime;

      const resultWeakens: number = CloudServerInfo.runWeaks(cloudServersInfoList, toDoWeakens, target);
      toDoWeakens -= resultWeakens;

      await ns.sleep(weakenT + scriptDelay);
    } while (toDoWeakens > 0);

    // 2. Rise to max money
    await runGrowWeakGroup();

  }

  async function hackCycle() {
    const cycleFlag: boolean = true;
    do {
      await runHackWeakGroup();
      await runGrowWeakGroup();
    } while (cycleFlag);
  }

  async function runHackWeakGroup() {

    let toDoWeakens: number = 0;
    let toDoHacks: number = 0;

    updateServerInfo();
    let returnInfoResult = serverInfo.getCurrentToDoHacks();
    if (returnInfoResult === null || returnInfoResult?.hackThreads === 0) {
      return;
    }
    const weakenT: number = serverInfo.weakenTime;
    let hackT: number = serverInfo.hackTime;

    toDoHacks = returnInfoResult.hackThreads;
    toDoWeakens = ServerInfo.getToDoWeakens(returnInfoResult.secLevelRise);

    CloudServerInfo.runWeaks(cloudServersInfoList, toDoWeakens, target);

    await ns.sleep(weakenT - hackT - scriptDelay);

    let sleepFlag: boolean = true;
    do {
      const newHackT = serverInfo.hackTime;
      if (newHackT === hackT) {
        sleepFlag = false;
        continue;
      }
      await ns.sleep(hackT - newHackT);
      hackT = newHackT;
    } while (sleepFlag);

    CloudServerInfo.runHacks(cloudServersInfoList, toDoHacks, target);
    await ns.sleep(hackT + scriptDelay);
  }

  async function runGrowWeakGroup() {

    let toDoWeakens: number = 0;
    let toDoGrows: number = 0;

    do {
      updateServerInfo();
      let returnInfoResult = serverInfo.getCurrentToDoGrows();
      if (returnInfoResult === null || returnInfoResult?.growsThreads === 0) {
        break;
      }
      const weakenT: number = serverInfo.weakenTime;
      let growT: number = serverInfo.growTime;

      toDoGrows = returnInfoResult.growsThreads;
      toDoWeakens = ServerInfo.getToDoWeakens(returnInfoResult.secLevelRise);

      CloudServerInfo.runWeaks(cloudServersInfoList, toDoWeakens, target);

      await ns.sleep(weakenT - growT - scriptDelay);

      let sleepFlag: boolean = true;
      do {
        const newGrowT = serverInfo.growTime;
        if (newGrowT === growT) {
          sleepFlag = false;
          continue;
        }
        await ns.sleep(growT - newGrowT);
        growT = newGrowT;
      } while (sleepFlag);

      const resultGrows: number = CloudServerInfo.runGrows(cloudServersInfoList, toDoGrows, target);
      toDoGrows -= resultGrows;
      await ns.sleep(growT + scriptDelay);
    } while (toDoGrows > 0);
  }

  function updateServerInfo() {
    serverInfo = ServerInfo.getServerInfo(ns, target);
  }

  function updateCludServersInfo() {
    cloudServersInfoList = CloudServerInfo.getCloudServersInfoRaw(ns);
  }
}