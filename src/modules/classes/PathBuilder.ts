import { basePath } from "../constants";

export class PathBuilder {
  public static get root(): string {
    return basePath;
  }

  public static get handlers(): string {
    return basePath + "handlers/";
  }

  public static get remoteHandlers(): string {
    return basePath + "remoteHandlers/";
  }

  public static get modules(): string {
    return basePath + "modules/";
  }

  public static get classes(): string {
    return basePath + "modules/classes/";
  }
}
