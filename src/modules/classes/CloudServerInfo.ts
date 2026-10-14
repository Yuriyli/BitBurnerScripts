export class CloudServerInfo {
  private constructor(private ns: NS, public name: string,
    private weakenCost: number, private growCost: number, private hackCost: number) {

  }

  private static get weakenScriptAdress(): string {
    return "remoteHandlers/weakenHandler.ts";
  }

  private static get growScriptAdress(): string {
    return "remoteHandlers/growHandler.ts";
  }

  private static get hackScriptAdress(): string {
    return "remoteHandlers/hackHandler.ts";
  }

  public get freeRam(): number {
    return this.ns.getServerMaxRam(this.name) - this.ns.getServerUsedRam(this.name);
  }

  public get freeWeakenSlots(): number {
    return Math.floor(this.freeRam / this.weakenCost);
  }

  public get freeGrowSlots(): number {
    return Math.floor(this.freeRam / this.growCost);
  }

  public get freeHackSlots(): number {
    return Math.floor(this.freeRam / this.hackCost);
  }

  public tryRunWeakens(targetThreads: number, target: string): number {
    const slots: number = this.freeWeakenSlots;
    if (slots === 0) {
      return 0;
    }
    let finalThreads: number = targetThreads;

    if (slots < targetThreads) {
      finalThreads = slots;
    }

    const resultExec: number = this.ns.exec(CloudServerInfo.weakenScriptAdress, this.name, finalThreads, target);
    if (resultExec === 0) {
      return 0;
    } else {
      return finalThreads;
    }
  }

  public tryRunGrows(targetThreads: number, target: string): number {
    const slots: number = this.freeGrowSlots;
    if (slots === 0) {
      return 0;
    }
    let finalThreads: number = targetThreads;

    if (slots < targetThreads) {
      finalThreads = slots;
    }

    const resultExec: number = this.ns.exec(CloudServerInfo.growScriptAdress, this.name, finalThreads, target);
    if (resultExec === 0) {
      return 0;
    } else {
      return finalThreads;
    }
  }

  public tryRunHacks(targetThreads: number, target: string): number {
    const slots: number = this.freeHackSlots;
    if (slots === 0) {
      return 0;
    }
    let finalThreads: number = targetThreads;

    if (slots < targetThreads) {
      finalThreads = slots;
    }

    const resultExec: number = this.ns.exec(CloudServerInfo.hackScriptAdress, this.name, finalThreads, target);
    if (resultExec === 0) {
      return 0;
    } else {
      return finalThreads;
    }
  }

  public killWGHByTargetName(target: string) {
    this.ns.scriptKill(CloudServerInfo.weakenScriptAdress, target);
    this.ns.scriptKill(CloudServerInfo.growScriptAdress, target);
    this.ns.scriptKill(CloudServerInfo.hackScriptAdress, target);
  }

  // static ---------------------------------------------

  public static getCloudServersInfo(ns: NS)
    : { cloudServersInfoList: Array<CloudServerInfo>, totalWeakens: number, totalGrows: number, totalHacks: number } {
    const serverNamesList: Array<string> = ns.cloud.getServerNames();
    const weakenCost: number = ns.getScriptRam(CloudServerInfo.weakenScriptAdress, "home");
    const growCost: number = ns.getScriptRam(CloudServerInfo.growScriptAdress, "home");
    const hackCost: number = ns.getScriptRam(CloudServerInfo.hackScriptAdress, "home");

    const cloudServersInfoList: Array<CloudServerInfo> = new Array<CloudServerInfo>();
    let totalWeakens: number = 0;
    let totalGrows: number = 0;
    let totalHacks: number = 0;

    for (let i = 0; i < serverNamesList.length; i++) {
      const cloudServer: CloudServerInfo = new CloudServerInfo(ns, serverNamesList[i], weakenCost, growCost, hackCost);
      totalWeakens += cloudServer.freeWeakenSlots;
      totalGrows += cloudServer.freeGrowSlots;
      totalHacks += cloudServer.freeHackSlots;
      cloudServersInfoList.push(cloudServer);
    }

    return { cloudServersInfoList, totalWeakens, totalGrows, totalHacks }
  }

  public static getCloudServersInfoRaw(ns: NS): Array<CloudServerInfo> {
    const serverNamesList: Array<string> = ns.cloud.getServerNames();
    const weakenCost: number = ns.getScriptRam(CloudServerInfo.weakenScriptAdress, "home");
    const growCost: number = ns.getScriptRam(CloudServerInfo.growScriptAdress, "home");
    const hackCost: number = ns.getScriptRam(CloudServerInfo.hackScriptAdress, "home");

    const cloudServersInfoList: Array<CloudServerInfo> = new Array<CloudServerInfo>();

    for (let i = 0; i < serverNamesList.length; i++) {
      const cloudServer: CloudServerInfo = new CloudServerInfo(ns, serverNamesList[i], weakenCost, growCost, hackCost);
      cloudServersInfoList.push(cloudServer);
    }

    return cloudServersInfoList
  }

  public static runWeaks(servers: Array<CloudServerInfo>, targetThreads: number, target: string): number {
    if (targetThreads <= 0) {
      return 0;
    }
    let result: number = 0;
    let threadsToRun: number = targetThreads;

    for (let i = 0; i < servers.length; i++) {
      if (result >= targetThreads) {
        break;
      }

      const server: CloudServerInfo = servers[i];
      const runsResult: number = server.tryRunWeakens(threadsToRun, target);

      result += runsResult;
      threadsToRun -= runsResult;
    }

    return result;
  }

  public static runGrows(servers: Array<CloudServerInfo>, targetThreads: number, target: string): number {
    if (targetThreads <= 0) {
      return 0;
    }
    let result: number = 0;
    let threadsToRun: number = targetThreads;

    for (let i = 0; i < servers.length; i++) {
      if (result >= targetThreads) {
        break;
      }

      const server: CloudServerInfo = servers[i];
      const runsResult: number = server.tryRunGrows(threadsToRun, target);

      result += runsResult;
      threadsToRun -= runsResult;
    }

    return result;
  }

  public static runHacks(servers: Array<CloudServerInfo>, targetThreads: number, target: string): number {
    if (targetThreads <= 0) {
      return 0;
    }
    let result: number = 0;
    let threadsToRun: number = targetThreads;

    for (let i = 0; i < servers.length; i++) {
      if (result >= targetThreads) {
        break;
      }

      const server: CloudServerInfo = servers[i];
      const runsResult: number = server.tryRunHacks(threadsToRun, target);

      result += runsResult;
      threadsToRun -= runsResult;
    }

    return result;
  }

  public static killAllWGHByTargetName(servers: Array<CloudServerInfo>, target: string) {
    for (let i = 0; i < servers.length; i++) {
      const server: CloudServerInfo = servers[i];
      server.killWGHByTargetName(target);
    }
  }
}