import stylus from "stylus";
import { WK } from "../../types";
import { relative, dirname } from "path";
import { normalize } from "asset-pipeline/js/path";

export function StylusPluginFactory(config: WK.ProjectConfig) {

  const nodes  = stylus.nodes

  return function(styl: any) {
    const filename = styl.options.filename

    styl.define('asset_path', function( strObject ) {
      let path = strObject.string
      const asset = config.assets.pipeline.manifest.getWithSource(path)
      if (!asset) return strObject
      path = normalize(relative(dirname(filename), asset.source.fullpath.join(asset.input).os()), "web")
      return new nodes.Literal('url("' + path + '")')
    })

    styl.define('asset_url', function( strObject ) {
      let path = strObject.string
      const asset = config.assets.pipeline.manifest.getWithSource(path)
      if (!asset) return strObject
      path = normalize(relative(dirname(filename), asset.source.fullpath.join(asset.input).os()), "web")
      return new nodes.Literal('url("' + path + '")')
    })
  }

}
