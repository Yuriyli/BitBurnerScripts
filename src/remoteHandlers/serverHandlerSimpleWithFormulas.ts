import { CloudServerInfo } from "../modules/classes/CloudServerInfo";
import { ServerInfo } from "../modules/classes/ServerInfo";
import { ServerInfoWithFormulas } from "../modules/classes/ServerInfoWithFormulas";

export async function main(ns: NS) {
  const target = ns.args[0] as string;

  if (!target) {
    ns.tprint("Argument [0] \"target\" required");
    return;
  }

  const scriptDelay = 50;

  let serverInfo: ServerInfoWithFormulas = ServerInfoWithFormulas.getServerInfoWithFormulas(ns, target);
  let cloudServersInfoList: Array<CloudServerInfo> = CloudServerInfo.getCloudServersInfoRaw(ns);

  // Kill version without formulas if exists on home server
  killSimpleVersion();
  // Kill all runing scripts on cloud servers. Requested after reboot.
  CloudServerInfo.killAllWGHByTargetName(cloudServersInfoList, target);

  // Needed because on low money PrepareServer() can calculate wrong grow count. 
  do {
    await PrepareServer();
    serverInfo.updateServer();
  }
  while (!serverInfo.serverIsPrepared);

  let cycleFlag: boolean = true;
  do {
    await hwgCycle();
  } while (cycleFlag);

  async function PrepareServer() {
    let toDoWeakens: number = 0;
    let toDoGrows: number = 0;

    // 1. Weaken to 0
    do {
      serverInfo.updateServer();
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

  async function hwgCycle() {
    const weakenTime: number = serverInfo.weakenTime;
    const { hacks, hackWeakens, grows, growWeakens } = serverInfo.getWGHCycle();

    runHacks(weakenTime, hacks);

    ns.asleep(scriptDelay)
      .then(() => runWeakens(weakenTime, hackWeakens));

    ns.asleep(scriptDelay * 2)
      .then(() => runGrows(weakenTime, grows));

    ns.asleep(scriptDelay * 3)
      .then(() => runWeakens(weakenTime, growWeakens));

    await ns.asleep(weakenTime + (scriptDelay * 4));
  }

  async function runWeakens(wT: number, threads: number) {
    let weakenTime: number = wT;
    let diffTime: number = 0;

    // Pause  if hack skill ++ and weakTime --
    do {
      const currentWeakenTime: number = serverInfo.weakenTime;
      diffTime = weakenTime - currentWeakenTime;
      if (diffTime > 0) {
        weakenTime = currentWeakenTime;
        await ns.asleep(diffTime);
      }
    } while (diffTime > 0);

    CloudServerInfo.runWeaks(cloudServersInfoList, threads, target);
  }

  async function runHacks(wT: number, threads: number) {
    let weakenTime: number = wT;
    let hackTime: number = serverInfo.hackTime;
    let pauseTime: number = weakenTime - hackTime;

    await ns.asleep(pauseTime);

    do {
      const currentHackTime: number = serverInfo.hackTime;
      pauseTime = hackTime - currentHackTime;
      if (pauseTime > 0) {
        hackTime = currentHackTime;
        await ns.asleep(pauseTime);
      }
    } while (pauseTime > 0);

    CloudServerInfo.runHacks(cloudServersInfoList, threads, target);
  }

  async function runGrows(wT: number, threads: number) {
    let weakenTime: number = wT;
    let growTime: number = serverInfo.growTime;
    let pauseTime: number = weakenTime - growTime;

    await ns.asleep(pauseTime);

    do {
      const currentGrowTime: number = serverInfo.growTime;
      pauseTime = growTime - currentGrowTime;
      if (pauseTime > 0) {
        growTime = currentGrowTime;
        await ns.asleep(pauseTime);
      }
    } while (pauseTime > 0);

    CloudServerInfo.runGrows(cloudServersInfoList, threads, target);
  }

  async function runGrowWeakGroup() {

    let toDoWeakens: number = 0;
    let toDoGrows: number = 0;

    do {
      serverInfo.updateServer();
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

  function updateCloudServersInfo() {
    cloudServersInfoList = CloudServerInfo.getCloudServersInfoRaw(ns);
  }

  function killSimpleVersion() {
    ns.kill("remoteHandlers/serverHandlerSimple.ts", "home", target);
  }

}
