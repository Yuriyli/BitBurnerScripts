import { getAllUnrootedServerNames, getAllHackableServers, rootServer } from "../modules/server"

export async function main(ns: NS) {
  let isDone: boolean = false;
  while (!isDone) {
    const unrooted: Array<string> = getAllUnrootedServerNames(ns);

    if (unrooted.length <= 0) {
      isDone = true;
      continue;
    }

    const hackable: Array<string> = getAllHackableServers(ns);

    hackable.forEach(s => {
      rootServer(ns, s);
    })

    await ns.asleep(60000);
  }
}