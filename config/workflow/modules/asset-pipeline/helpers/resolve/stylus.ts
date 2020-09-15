import stylus from "stylus";
import { WK } from "../../../../types";

export function StylusPluginFactory(config: WK.ProjectConfig) {

  const nodes = stylus.nodes
  const pipeline = config.assets.pipeline

  return function(styl: any) {
    const filename = styl.options.filename

    styl.define('asset_path', function( strObject ) {
      const path = pipeline.getPath(strObject.string, { from: filename })
      return new nodes.Literal('url("' + path + '")')
    })

    styl.define('asset_url', function( strObject ) {
      const path = pipeline.getUrl(strObject.string, { from: filename })
      return new nodes.Literal('url("' + path + '")')
    })

    styl.define('asset_path_raw', function( strObject ) {
      const path = pipeline.getPath(strObject.string, { from: filename })
      return new nodes.Literal(path)
    })

    styl.define('asset_url_raw', function( strObject ) {
      const path = pipeline.getUrl(strObject.string, { from: filename })
      return new nodes.Literal( path)
    })
  }

}
