import { WK } from "../../../../types";
import { resolvePath } from "../utils";

export function ejsHelpers(config: WK.ProjectConfig) {
  config["ejs"].helpers.asset_url = function () {
    const filename = this.context.resourcePath
    return function (path: string) {
      const result = resolvePath(path, filename, config.assets.pipeline)
      return result.path
    }
  }
}