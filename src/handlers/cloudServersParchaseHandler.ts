import { installRemoteHandlers } from "../modules/server";

export async function main(ns: NS) {
  const baseName: string = "CloudServer_";
  const serverLimit: number = ns.cloud.getServerLimit();
  const serverMaxPower: number = Math.log2(ns.cloud.getRamLimit());
  let power: number = 5;
  let currentServerIndex: number = ns.cloud.getServerNames().length;

  if (currentServerIndex < serverLimit) {
    await purchaseNewServers();
  }

  updatePowerAndCurrentIndex();

  await upgradeServers();

  async function purchaseNewServers(): Promise<void> {
    do {
      const cost: number = ns.cloud.getServerCost(2 ** power);
      if (cost > ns.getServerMoneyAvailable("home")) {
        await ns.sleep(60000);
        continue;
      }

      const result: string = ns.cloud.purchaseServer(baseName + currentServerIndex, 2 ** power);
      ns.tprint('New server "' + result + '" parchased.'
        + " Cost: " + ns.format.number(cost) + "."
        + " Ram: " + ns.format.ram(2 ** power) + ".");
      installRemoteHandlers(ns, result);

      ++currentServerIndex;
    } while (currentServerIndex < serverLimit);

  }

  function updatePowerAndCurrentIndex(): void {
    currentServerIndex = 0;
    const servers: Array<string> = ns.cloud.getServerNames();

    const firstServerPower: number = Math.log2(ns.getServerMaxRam(servers[0]));

    if (firstServerPower > power) {
      power = firstServerPower;
      currentServerIndex = 1;
    } else {
      ++power;
      return;
    }

    for (let i = 1; i < serverLimit; i++) {
      const serverPower: number = Math.log2(ns.getServerMaxRam(servers[i]));
      if (serverPower < power) {
        currentServerIndex = i;
        return;
      }
    }

    currentServerIndex = 0;
    ++power;
  }


  async function upgradeServers(): Promise<void> {
    const servers: Array<string> = ns.cloud.getServerNames();

    do {
      if (currentServerIndex === serverLimit) {
        ++power;
        currentServerIndex = 0;
      }

      const cost: number = ns.cloud.getServerUpgradeCost(servers[currentServerIndex], 2 ** power);
      if (cost > ns.getServerMoneyAvailable("home")) {
        await ns.sleep(60000);
        continue;
      }

      const result: boolean = ns.cloud.upgradeServer(servers[currentServerIndex], 2 ** power);
      if (result) {
        ns.tprint('Server "' + servers[currentServerIndex] + '" upgraded from '
          + ns.format.ram(2 ** (power - 1))
          + " to " + ns.format.ram(2 ** power) + "."
          + " Cost: " + ns.format.number(cost) + ".");
        ++currentServerIndex;
      } else {
        ns.tprint('Failed to upgrade "' + servers[currentServerIndex] + '"');
        await ns.sleep(60000)
      }
    } while (power !== serverMaxPower || currentServerIndex < serverLimit);
  }
}