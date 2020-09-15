import { normalize } from "asset-pipeline/js/path";
import { Pipeline } from "asset-pipeline/js/pipeline";
import { dirname, relative } from "path";
import { ANY_ENTRY_TAG_REGEX } from "../../../utils/entry";

export type AssetNode = {
  path: string,
  type: "literal" | "require"
}

export function resolvePath(path: string, issuer: string, pipeline: Pipeline): AssetNode {
  const asset = pipeline.manifest.getWithSource(path)
  if (asset) {
    if (ANY_ENTRY_TAG_REGEX.test(asset.tag) || asset.source.uuid === "__shadow__") {
      path = pipeline.getUrl(asset.input)
      return { path, type: "literal" }
    }

    path = relative(dirname(issuer), asset.source.fullpath.join(asset.input).os())
    path = normalize(path, "web")
    return { path, type: "require" }
  }

  path = normalize(path, "web")
  return { path, type: "literal" }
}