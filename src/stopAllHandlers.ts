import { CloudServerInfo } from "./modules/classes/CloudServerInfo";
import { HomeServerInfo } from "./modules/classes/HomeServerInfo";
import { PathBuilder } from "./modules/classes/PathBuilder";

export async function main(ns: NS) {
  ns.scriptKill(
    PathBuilder.remoteHandlers + "serverHandlerPrimitive.ts",
    "home",
  );
  ns.scriptKill(PathBuilder.remoteHandlers + "serverHandlerSimple.ts", "home");
  ns.scriptKill(
    PathBuilder.remoteHandlers + "serverHandlerSimpleHome.ts",
    "home",
  );
  ns.scriptKill(
    PathBuilder.remoteHandlers + "serverHandlerSimpleWithFormulas.ts",
    "home",
  );
  ns.scriptKill(PathBuilder.remoteHandlers + "serverHandlerShotgun.ts", "home");

  const cloudServers: Array<CloudServerInfo> =
    CloudServerInfo.getCloudServersInfoRaw(ns);
  cloudServers.forEach((s) => {
    const name: string = s.name;
    ns.scriptKill(PathBuilder.remoteHandlers + "weakenHandler.ts", name);
    ns.scriptKill(PathBuilder.remoteHandlers + "growHandler.ts", name);
    ns.scriptKill(PathBuilder.remoteHandlers + "hackHandler.ts", name);
  });

  HomeServerInfo.killAllWGHScripts(ns);
}
