import { PageDataFunction } from "../page-data/module"

// Add assets paths to page data
export const addAssets: PageDataFunction = async (data, { assets }) => {
  assets.pipeline.fetch(true)
  const entries = Object.entries(assets.pipeline.manifest.export("output_key"))
  const outputs: Record<string, { path: string, url: string }> = {}
  for (const [key, value] of entries) {
    outputs[key] = value.output
  }
  data["assets"] = outputs
}