import ts from "typescript";
import { Visitor } from "../typescript/transformer";
import { FileData } from "../file-generator/file-generator-plugin";
import { WK } from "../../types";
import { basename, extname, relative, dirname } from "path";

const ASSET_REG = /asset_(url|path)/
type AcceptedType = ts.StringLiteral | ts.NoSubstitutionTemplateLiteral

export const transformer = (config: WK.ProjectConfig) => {
  const t: Visitor = (node, factory) => {
    if (ts.isCallExpression(node) && ASSET_REG.test(node.expression.getText()) && node.arguments.length === 1) {
      const { pipeline } = config.assets
      const arg0 = node.arguments[0]

      // StringLiteral = "flags.png" | 'flags.png' (accepted)
      // NoSubstitutionTemplateLiteral = `flags.png` (accepted)
      // TemplateLiteral = `flags.${extension}` (rejected)
      // BinaryExpression = "flags" + extension | 'flags' + extension | `flags` + extension (rejected)
      const isStringLiteral = ts.isStringLiteral(arg0) || ts.isNoSubstitutionTemplateLiteral(arg0)
      if (!isStringLiteral) return node

      let path = (arg0 as AcceptedType).text.trim()
      const fileName = node.getSourceFile().fileName

      // Check if the asset exist in asset-pipeline
      const asset = pipeline.manifest.get(path)

      // If the asset does not exist, return given path
      if (!asset) return ts.createStringLiteral(path)
      const source = pipeline.source.get(asset.source.uuid)

      // If the source does not exist, return given path
      if (!source) return ts.createStringLiteral(path)

      // Else replace asset_path()/asset_url() by require() and file-loader do the rest
      path = relative(dirname(fileName), source.fullpath.join(path).os())
      const id = factory.createIdentifier("require")
      const lit = ts.createStringLiteral(path)
      return factory.createCallExpression(id, [], [lit])
    }

    return node
  }
  return t
}

export const typings = (config: WK.ProjectConfig) => {
  return {
    filename: "assets.d.ts",
    content() {
      let content = ""
      content += `import { PAGE } from "./${basename(config.pageData.filename, extname(config.pageData.filename))}"\n`
      content += `declare global {\n`
      content += `  export function asset_path(key: keyof typeof PAGE["assets"]): string\n`
      content += `  export function asset_url(key: keyof typeof PAGE["assets"]): string\n`
      content += `}\n`
      return content
    }
  } as FileData
}