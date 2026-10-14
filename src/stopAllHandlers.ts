import { CloudServerInfo } from "./modules/classes/CloudServerInfo";
import { HomeServerInfo } from "./modules/classes/HomeServerInfo";

export async function main(ns: NS) {
  ns.scriptKill("remoteHandlers/serverHandlerPrimitive.ts", "home");
  ns.scriptKill("remoteHandlers/serverHandlerSimple.ts", "home");
  ns.scriptKill("remoteHandlers/serverHandlerSimpleHome.ts", "home");
  ns.scriptKill("remoteHandlers/serverHandlerSimpleWithFormulas.ts", "home");
  ns.scriptKill("remoteHandlers/serverHandlerShotgun.ts", "home");

  const cloudServers: Array<CloudServerInfo> = CloudServerInfo.getCloudServersInfoRaw(ns);
  cloudServers.forEach(s => {
    const name: string = s.name;
    ns.scriptKill("remoteHandlers/weakenHandler.ts", name);
    ns.scriptKill("remoteHandlers/growHandler.ts", name);
    ns.scriptKill("remoteHandlers/hackHandler.ts", name);
  })

  HomeServerInfo.killAllWGHScripts(ns);
}