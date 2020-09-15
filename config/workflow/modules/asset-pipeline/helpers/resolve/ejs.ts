import { WK } from "../../../../types";
import { EJSLoaderContext } from "../../../../../modules/ejs/ejs-loader";

export function ejsHelpers(config: WK.ProjectConfig) {
  // Add asset_path() helper
  config["ejs"].helpers.asset_path = function () {
    return getPath.call(this, config, "asset_path")
  }

  // Add asset_url() helper
  config["ejs"].helpers.asset_url = function () {
    return getPath.call(this, config, "asset_url")
  }
}

function getPath(this: EJSLoaderContext, config: WK.ProjectConfig, type: "asset_url" | "asset_path") {
  const resourcePath = this.context.resourcePath

  return function (path: string, from?: string) {
    const result = type === "asset_path" ?
      config.assets.pipeline.getPath(path, { from: from || resourcePath }) :
      config.assets.pipeline.getUrl(path, { from: from || resourcePath })
    return result
  }
}