import { Pipeline } from "asset-pipeline/js/pipeline";
import stylus from "stylus";

export function StylusPluginFactory( pipeline: Pipeline ) {

  const nodes  = stylus.nodes

  return function(styl: any) {

    const filename = styl.options.filename as string

    function asset_path(p: string) {
      return pipeline.resolve.getPath(p, { from: filename })
    }

    function asset_url(p: string) {
      return pipeline.resolve.getUrl(p, { from: filename })
    }

    styl.define('asset_path', function( strObject: any ) {
      return new nodes.Literal('url("' + asset_path( strObject.string ) + '")')
    })

    styl.define('asset_path_src', function( strObject: any ) {
      return new nodes.Literal(asset_path( strObject.string ))
    })

    styl.define('asset_url', function( strObject: any ) {
      return new nodes.Literal('url("' + asset_url( strObject.string ) + '")')
    })

    styl.define('asset_url_src', function( strObject: any ) {
      return new nodes.Literal(asset_url( strObject.string ))
    })

  }

}