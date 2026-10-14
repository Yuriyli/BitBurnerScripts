export async function main(ns: NS) {
  const target = ns.args[0] as string;

  if (!target) {
    ns.tprint("Argument [0] \"target\" required");
    return;
  }

  const sMaxMoney = ns.getServerMaxMoney(target);
  const sMinSec = ns.getServerMinSecurityLevel(target);

  while (true) {
    if (ns.getServerSecurityLevel(target) > sMinSec) {
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < sMaxMoney) {
      await ns.grow(target);
    } else {
      await ns.hack(target);
    }

  }
}