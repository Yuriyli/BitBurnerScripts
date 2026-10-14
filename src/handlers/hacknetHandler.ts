import { HacknetNodeInfo } from "../modules/classes/HacknetNodeInfo";
import { HacknetNodeUpgrade } from "../modules/classes/HacknetNodeUpgrade";

export async function main(ns: NS) {
  const pauseTime: number = 60000;
  const delay: number = 100;

  let mainCycleFlag: boolean = true;
  while (mainCycleFlag) {

    let innerCycleFlag: boolean = true;
    while (innerCycleFlag) {
      const node: HacknetNodeUpgrade = HacknetNodeInfo.getCheapestUpgrade(ns);
      
      const result: boolean = node.upgrade();
      if (result) {
        await ns.sleep(delay);
      } else {
        innerCycleFlag = false;
      }
    }

    await ns.sleep(pauseTime);
  }

}