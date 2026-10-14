export class ServerInfo {

  constructor(protected ns: NS, public server: Server,
    private weakenCost: number, private growCost: number, private hackCost: number) {

  }

  public get name(): string {
    return this.server.hostname;
  }

  public get freeRam(): number {
    return this.server.maxRam - this.server.ramUsed;
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

  public get weakenTime(): number {
    return this.ns.getWeakenTime(this.name);
  }

  public get growTime(): number {
    return this.ns.getGrowTime(this.name);
  }

  public get hackTime(): number {
    return this.ns.getHackTime(this.name);
  }

  public get serverIsPrepared(): boolean {
    if (this.server.moneyAvailable === undefined || this.server.moneyMax === undefined) {
      return false;
    }
    if (this.server.moneyAvailable !== this.server.moneyMax) {
      return false;
    }
    if (this.server.minDifficulty === undefined || this.server.hackDifficulty === undefined) {
      return false;
    }
    if (this.server.minDifficulty !== this.server.hackDifficulty) {
      return false;
    }
    return true;
  }

  public updateServer() {
    this.server = this.ns.getServer(this.name);
  }

  public getCurrentToDoWeakens(secPerWeaken: number = 0.05): number {
    if (this.server.hackDifficulty === undefined || this.server.minDifficulty === undefined) { return 0; }
    const secToWeak: number = this.server.hackDifficulty - this.server.minDifficulty;
    return Math.ceil(secToWeak / secPerWeaken);
  }

  public getCurrentToDoGrows(cores: number = 1): { growsThreads: number, secLevelRise: number } | null {
    if (this.server.moneyAvailable === undefined || this.server.moneyMax === undefined) {
      return null;
    }
    if (this.server.moneyAvailable === 0) {
      this.server.moneyAvailable = 1;
    }
    const multiplier: number = 1 / (this.server.moneyAvailable / this.server.moneyMax);
    const growsThreads: number = Math.ceil(this.ns.growthAnalyze(this.name, multiplier, cores));

    const secLevelRise: number = this.ns.growthAnalyzeSecurity(growsThreads, this.name, cores);

    return { growsThreads, secLevelRise };
  }

  public getCurrentToDoHacks(moneyPart: number = 0.5): { hackThreads: number, secLevelRise: number } | null {
    if (this.server.moneyAvailable === undefined) {
      return null;
    }

    const moneyAmount: number = this.server.moneyAvailable * moneyPart;
    const hackThreads: number = Math.floor(this.ns.hackAnalyzeThreads(this.name, moneyAmount));
    const secLevelRise: number = this.ns.hackAnalyzeSecurity(hackThreads, this.name);

    return { hackThreads, secLevelRise };
  }

  // static ---------------------------------------------

  public static getServerInfo(ns: NS, serverName: string): ServerInfo {
    const weakenCost: number = ns.getScriptRam("remoteHandlers/weakenHandler.ts", "home");
    const growCost: number = ns.getScriptRam("remoteHandlers/growHandler.ts", "home");
    const hackCost: number = ns.getScriptRam("remoteHandlers/hackHandler.ts", "home");

    return new ServerInfo(ns, ns.getServer(serverName), weakenCost, growCost, hackCost);
  }

  public static getServersInfo(ns: NS, servers: Array<string>): Array<ServerInfo> {
    const result: Array<ServerInfo> = new Array<ServerInfo>();

    for (let i = 0; i < servers.length; i++) {
      result.push(this.getServerInfo(ns, servers[i]));
    }

    return result;
  }

  public static countFreeWeakenSlots(serversInfo: Array<ServerInfo>): number {
    let result: number = 0;

    for (let i = 0; i < serversInfo.length; i++) {
      result += serversInfo[i].freeWeakenSlots;
    }

    return result;
  }

  public static countFreeGrowSlots(serversInfo: Array<ServerInfo>): number {
    let result: number = 0;

    for (let i = 0; i < serversInfo.length; i++) {
      result += serversInfo[i].freeGrowSlots;
    }

    return result;
  }

  public static countFreeHackSlots(serversInfo: Array<ServerInfo>): number {
    let result: number = 0;

    for (let i = 0; i < serversInfo.length; i++) {
      result += serversInfo[i].freeHackSlots;
    }

    return result;
  }

  public static getToDoWeakens(secLevelToWeaken: number, secPerWeaken: number = 0.05): number {
    return Math.ceil(secLevelToWeaken / secPerWeaken);
  }
}
