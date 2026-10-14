import { ServerInfo } from "./ServerInfo";

export class ServerInfoWithFormulas extends ServerInfo {

  private getNewServerInstance(): Server {
    return this.ns.getServer(this.name);
  }

  private getMaximizedServer(): Server {
    const result: Server = this.getNewServerInstance();

    result.moneyAvailable = result.moneyMax;
    result.hackDifficulty = result.minDifficulty;

    return result;
  }

  private getHalfedServer(): Server {
    const result: Server = this.getNewServerInstance();

    result.moneyMax ??= 0;
    result.moneyAvailable = Math.floor(result.moneyMax / 2);
    result.hackDifficulty = result.minDifficulty;

    return result;
  }

  public getWGHCycle(): { hacks: number, hackWeakens: number, grows: number, growWeakens: number } {
    const player: Player = this.ns.getPlayer();
    const maxServer: Server = this.getMaximizedServer();
    const halfedServer: Server = this.getHalfedServer();
    const weakenEffect: number = this.ns.formulas.hacking.weakenEffect(1);

    const hackPercent: number = this.ns.formulas.hacking.hackPercent(maxServer, player);
    const hacks: number = Math.floor(0.5 / hackPercent);

    const hackSecLevel: number = this.ns.hackAnalyzeSecurity(hacks, this.name);
    const hackWeakens: number = Math.ceil(hackSecLevel / weakenEffect);

    const grows: number = this.ns.formulas.hacking.growThreads(halfedServer, player, halfedServer.moneyMax ?? 0);

    //Magic grow multiplier  ~ 0.08
    const growWeakens: number = Math.ceil(0.081 * grows);

    return { hacks, hackWeakens, grows, growWeakens };
  }

  public static getServerInfoWithFormulas(ns: NS, serverName: string): ServerInfoWithFormulas {
    const weakenCost: number = ns.getScriptRam("remoteHandlers/weakenHandler.ts", "home");
    const growCost: number = ns.getScriptRam("remoteHandlers/growHandler.ts", "home");
    const hackCost: number = ns.getScriptRam("remoteHandlers/hackHandler.ts", "home");

    return new ServerInfoWithFormulas(ns, ns.getServer(serverName), weakenCost, growCost, hackCost);
  }

  public static getServersInfoWithFormulas(ns: NS, servers: Array<string>): Array<ServerInfoWithFormulas> {
    const result: Array<ServerInfoWithFormulas> = new Array<ServerInfoWithFormulas>();

    for (let i = 0; i < servers.length; i++) {
      result.push(this.getServerInfoWithFormulas(ns, servers[i]));
    }

    return result;
  }

}