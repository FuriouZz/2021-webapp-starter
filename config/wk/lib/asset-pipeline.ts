import { normalize } from "asset-pipeline/js/path";
import { Pipeline } from "asset-pipeline/js/pipeline";
import { dirname, relative } from "path";

export type AssetNode = {
  path: string,
  type: "literal" | "require"
}

export type ResolvePathOption = {
  useRequire: boolean,
  usePath: boolean
}

export function resolvePath(path: string, issuer: string, pipeline: Pipeline, options?: ResolvePathOption): AssetNode {
  options = Object.assign({
    useRequire: true,
    usePath: false
  }, options || {})

  const asset = pipeline.manifest.getAssetWithSource(path)
  if (asset) {
    if (asset.tag === "entry" || asset.source.uuid === "__shadow__") {
      path = options.usePath ? pipeline.getPath(asset.input) : pipeline.getUrl(asset.input)
      return { path, type: "literal" }
    }

    if (options.useRequire) {
      path = relative(dirname(issuer), asset.source.fullpath.join(asset.input).os())
      path = normalize(path, "web")
      return { path, type: "require" }
    } else {
      path = options.usePath ? pipeline.getPath(asset.input) : pipeline.getUrl(asset.input)
      return { path, type: "literal" }
    }
  }

  path = normalize(path, "web")
  return { path, type: "literal" }
}