import { CloudServerInfo } from "./modules/classes/CloudServerInfo";
import { ServerInfo } from "./modules/classes/ServerInfo";

export async function main(ns: NS) {

  const target = ns.args[0] as string;
  const cycles = ns.args[1] as number;
  const hacks = ns.args[2] as number;
  const hackWeakens = ns.args[3] as number;
  const grows = ns.args[4] as number;
  const growWeakens = ns.args[5] as number;

  if (typeof target !== "string" || typeof cycles !== "number" ||
    typeof hacks !== "number" || typeof hackWeakens !== "number" || typeof grows !== "number" || typeof growWeakens !== "number") {
    ns.tprint("Wrong args format! \n")
    ns.tprint("taget:string cycles:number hacks:number hackWeakens:number grows:number growWeakens:number \n")
    ns.tprint("n00dles 1 200 5 200 50")
    return;
  }

  let serverInfo: ServerInfo = ServerInfo.getServerInfo(ns, target);
  let cloudServersInfoList: Array<CloudServerInfo> = CloudServerInfo.getCloudServersInfoRaw(ns);

  const scriptDelay = 50;

  for (let i = 0; i < cycles; i++) {
    await hwgCycle(serverInfo.weakenTime, hacks, hackWeakens, grows, growWeakens);

    ns.tprint((i + 1) + " cycle finished")
  }

  ns.tprint("HGW finished")
  async function hwgCycle(weakenTime: number, hacks: number, hackWeakens: number, grows: number, growWeakens: number) {

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

}