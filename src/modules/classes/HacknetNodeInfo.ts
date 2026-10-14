import {
  HacknetNodeUpgrade, HacknetNewNodeUpgrade, HacknetNodeLevelUpgrade,
  HacknetNodeCoreUpgrade, HacknetNodeRamUpgrade
} from "./HacknetNodeUpgrade";

export class HacknetNodeInfo {
  public static getCheapestUpgrade(ns: NS): HacknetNodeUpgrade {
    const result: Array<HacknetNodeUpgrade> = new Array<HacknetNodeUpgrade>;

    result.push(new HacknetNewNodeUpgrade(ns));

    const nodePurchased: number = ns.hacknet.numNodes();
    for (let i = 0; i < nodePurchased; i++) {
      result.push(new HacknetNodeLevelUpgrade(ns, i));
      result.push(new HacknetNodeRamUpgrade(ns, i));
      result.push(new HacknetNodeCoreUpgrade(ns, i));
    }

    result.sort((a, b) => a.price - b.price);

    // result.forEach(u => ns.tprint(u.toString()));

    return result[0];
  }
}