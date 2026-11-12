import { PathBuilder } from "./PathBuilder";

export class HomeServerInfo {
  private constructor() {}

  private static get name(): string {
    return "home";
  }

  private static get weakenScriptAdress(): string {
    return PathBuilder.remoteHandlers + "weakenHandler.ts";
  }

  private static get growScriptAdress(): string {
    return PathBuilder.remoteHandlers + "growHandler.ts";
  }

  private static get hackScriptAdress(): string {
    return PathBuilder.remoteHandlers + "hackHandler.ts";
  }

  private static getWeakenCost(ns: NS): number {
    return ns.getScriptRam(this.weakenScriptAdress, this.name);
  }

  private static getGrowCost(ns: NS): number {
    return ns.getScriptRam(this.growScriptAdress, this.name);
  }

  private static getHackCost(ns: NS): number {
    return ns.getScriptRam(this.hackScriptAdress, this.name);
  }

  private static getFreeRam(ns: NS): number {
    return ns.getServerMaxRam(this.name) - ns.getServerUsedRam(this.name);
  }

  private static getFreeWeakenSlots(ns: NS): number {
    return Math.floor(this.getFreeRam(ns) / this.getWeakenCost(ns));
  }

  private static getFreeGrowSlots(ns: NS): number {
    return Math.floor(this.getFreeRam(ns) / this.getGrowCost(ns));
  }

  private static getFreeHackSlots(ns: NS): number {
    return Math.floor(this.getFreeRam(ns) / this.getHackCost(ns));
  }

  public static runWeakens(
    ns: NS,
    targetThreads: number,
    target: string,
  ): number {
    const slots: number = this.getFreeWeakenSlots(ns);
    if (slots === 0) {
      return 0;
    }
    let finalThreads: number = targetThreads;

    if (slots < targetThreads) {
      finalThreads = slots;
    }

    const resultExec: number = ns.exec(
      this.weakenScriptAdress,
      this.name,
      finalThreads,
      target,
    );
    if (resultExec === 0) {
      return 0;
    } else {
      return finalThreads;
    }
  }

  public static runGrows(
    ns: NS,
    targetThreads: number,
    target: string,
  ): number {
    const slots: number = this.getFreeWeakenSlots(ns);
    if (slots === 0) {
      return 0;
    }
    let finalThreads: number = targetThreads;

    if (slots < targetThreads) {
      finalThreads = slots;
    }

    const resultExec: number = ns.exec(
      this.growScriptAdress,
      this.name,
      finalThreads,
      target,
    );
    if (resultExec === 0) {
      return 0;
    } else {
      return finalThreads;
    }
  }

  public static runHacks(
    ns: NS,
    targetThreads: number,
    target: string,
  ): number {
    const slots: number = this.getFreeWeakenSlots(ns);
    if (slots === 0) {
      return 0;
    }
    let finalThreads: number = targetThreads;

    if (slots < targetThreads) {
      finalThreads = slots;
    }

    const resultExec: number = ns.exec(
      this.hackScriptAdress,
      this.name,
      finalThreads,
      target,
    );
    if (resultExec === 0) {
      return 0;
    } else {
      return finalThreads;
    }
  }

  public static killWGHScripts(ns: NS, target: string) {
    ns.kill(this.weakenScriptAdress, this.name, target);
    ns.kill(this.growScriptAdress, this.name, target);
    ns.kill(this.hackScriptAdress, this.name, target);
  }

  public static killAllWGHScripts(ns: NS) {
    ns.scriptKill(this.weakenScriptAdress, this.name);
    ns.scriptKill(this.growScriptAdress, this.name);
    ns.scriptKill(this.hackScriptAdress, this.name);
  }
}
