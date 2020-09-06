import { PageDataFunction } from "../page-data/module"
import { WK } from "../../types"

// Add assets paths to page data
export const addAssets = ({ assets }: WK.ProjectConfig) => {
  const item: PageDataFunction = async (data) => {
    assets.pipeline.fetch(true)
    const entries = Object.entries(assets.pipeline.manifest.export("output_key"))
    const outputs: Record<string, { path: string, url: string }> = {}
    for (const [key, value] of entries) {
      outputs[key] = value.output
    }
    data["assets"] = outputs
  }
  return item
}