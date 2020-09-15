import ts from "typescript";
import { Visitor } from "../../typescript/transformer";
import { WK } from "../../../types";
import { FileData } from "../../file-generator/file-generator-plugin";
import { basename, extname } from "path";
import { PageDataFunction } from "../../page/module";

const ASSET_REG = /asset_(url|path|filter)/
const ASSET_FILTER_REG = /asset_filter/
const ASSET_URL_REG = /asset_url/
type AcceptedType = ts.StringLiteral | ts.NoSubstitutionTemplateLiteral

function createLiteral(value: any, factory: ts.NodeFactory) {
  switch (typeof value) {
    case "boolean": return value === true ? factory.createTrue() : factory.createFalse()
    case "number": return factory.createNumericLiteral(value)
    case "string": return factory.createStringLiteral(value, false)
    case "object": {
      return factory.createObjectLiteralExpression(Object.entries(value).map((kv) => {
        return factory.createPropertyAssignment(createLiteral(kv[0], factory), createLiteral(kv[1], factory))
      }))
    }
    default: return factory.createNull()
  }
}

export const transformer: (config: WK.ProjectConfig) => Visitor = (config) => {
  return (node, factory) => {
    if (ts.isCallExpression(node) && ASSET_REG.test(node.expression.getText()) && node.arguments.length === 1) {
      const { pipeline } = config.assets
      const callExpression = node.expression.getText()
      const arg0 = node.arguments[0]

      // StringLiteral = "flags.png" | 'flags.png' (accepted)
      // NoSubstitutionTemplateLiteral = `flags.png` (accepted)
      // TemplateLiteral = `flags.${extension}` (rejected)
      // BinaryExpression = "flags" + extension | 'flags' + extension | `flags` + extension (rejected)
      const isStringLiteral = ts.isStringLiteral(arg0) || ts.isNoSubstitutionTemplateLiteral(arg0)
      if (!isStringLiteral) return node

      // asset_filter
      if (ASSET_FILTER_REG.test(callExpression)) {
        const match = (arg0 as AcceptedType).text.trim()
        const reg = new RegExp(match)
        const records: Record<string, { path: string, url: string }> = {}
        config.assets.pipeline.manifest.export("asset").filter(asset => {
          if (reg.test(asset.input)) {
            records[asset.input] = {
              path: config.assets.pipeline.getPath(asset.input),
              url: config.assets.pipeline.getUrl(asset.input),
            }
          }
        })

        return createLiteral(records, factory)
      }

      // asset_(path|url)
      else {
        let path = (arg0 as AcceptedType).text.trim()
        const filename = node.getSourceFile().fileName

        if (ASSET_URL_REG.test(callExpression)) {
          path = pipeline.getUrl(path, { from: filename })
        } else {
          path = pipeline.getPath(path, { from: filename })
        }

        return factory.createStringLiteral(path, false)
      }
    }

    return node
  }
}

export function typing(config: WK.ProjectConfig): FileData {
  const pagePath = basename(config.page.filename, extname(config.page.filename))

  return {
    filename: "assets.d.ts",
    content() {
      let content = ""
      content += `import { PAGE } from "./${pagePath}"\n`
      content += `type Asset = { path: string, url: string }\n`
      content += `declare global {\n`
      content += `  export function asset_path(key: keyof typeof PAGE["assets"]): string\n`
      content += `  export function asset_url(key: keyof typeof PAGE["assets"]): string\n`
      content += `  export function asset_filter(key: string): Record<string, Asset>\n`
      content += `}\n`
      return content
    }
  }
}

export function pageData(config: WK.ProjectConfig): PageDataFunction {
  return async (data) => {
    const entries = Object.entries(config.assets.pipeline.manifest.export("output_key"))
    const outputs: Record<string, { path: string, url: string }> = {}
    for (const [key, value] of entries) {
      outputs[key] = value.output
    }
    data["assets"] = outputs
  }
}