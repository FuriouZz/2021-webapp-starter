import { dirname, relative } from "path";
import stylus from "stylus";
import { WK } from "../../../../types";
import { resolvePath } from "../utils";

export function StylusPluginFactory(config: WK.ProjectConfig) {
  const nodes = stylus.nodes

  return function(styl: any) {
    const filename = styl.options.filename

    styl.define('asset_url', function( strObject ) {
      const result = resolvePath(strObject.string, filename, config.assets.pipeline)
      return new nodes.Literal('url("' + result.path + '")')
    })

    styl.define('asset_url_raw', function( strObject ) {
      const result = resolvePath(strObject.string, filename, config.assets.pipeline)
      return new nodes.Literal(result.path)
    })
  }
}
