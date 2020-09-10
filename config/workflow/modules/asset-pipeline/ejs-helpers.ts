import { WK } from "../../types";
import { RuleSetCondition } from "webpack";
import { EJSLoaderContext } from "../../../modules/ejs/ejs-loader";

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
  const context = this
  const resourcePath = this.context.resourcePath

  return function (path: string, from?: string) {
    const result = type === "asset_path" ?
      config.assets.pipeline.getPath(path, { from: from || resourcePath }) :
      config.assets.pipeline.getUrl(path, { from: from || resourcePath })

    const asset = config.assets.pipeline.manifest.getWithSource(path)

    if (asset && isFile(asset.input, config)) {
      const fullPath = asset.source.fullpath.join(asset.input).os()
      context.loadModule(fullPath)
    }

    return result
  }
}

function isFile(resourcePath: string, config: WK.ProjectConfig) {
  function testRule(rule: RuleSetCondition) {
    let valid = false
    if (rule instanceof RegExp) {
      valid = rule.test(resourcePath)
    } else if (typeof rule === "string") {
      valid = rule === resourcePath
    } else if (typeof rule === "function") {
      valid = rule(resourcePath)
    } else if (Array.isArray(rule)) {
      for (const r of rule) {
        valid = testRule(r)
        if (valid) return true
      }
    }
    return valid
  }

  return testRule(config.assets.rules.file)
}