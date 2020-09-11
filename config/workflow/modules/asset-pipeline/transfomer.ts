import ts from "typescript";
import { Visitor } from "../typescript/transformer";
import { WK } from "../../types";

const ASSET_REG = /asset_(url|path)/
const ASSET_URL_REG = /asset_url/
type AcceptedType = ts.StringLiteral | ts.NoSubstitutionTemplateLiteral

export const transformer: (config: WK.ProjectConfig) => Visitor = (config) => {
  return (node, factory) => {
    if (ts.isCallExpression(node) && ASSET_REG.test(node.expression.getText()) && node.arguments.length === 1) {
      const { pipeline } = config.assets
      const fnStr = node.expression.getText()
      const arg0 = node.arguments[0]

      // StringLiteral = "flags.png" | 'flags.png' (accepted)
      // NoSubstitutionTemplateLiteral = `flags.png` (accepted)
      // TemplateLiteral = `flags.${extension}` (rejected)
      // BinaryExpression = "flags" + extension | 'flags' + extension | `flags` + extension (rejected)
      const isStringLiteral = ts.isStringLiteral(arg0) || ts.isNoSubstitutionTemplateLiteral(arg0)
      if (!isStringLiteral) return node

      let path = (arg0 as AcceptedType).text.trim()
      const filename = node.getSourceFile().fileName

      if (ASSET_URL_REG.test(fnStr)) {
        path = pipeline.getUrl(path, { from: filename })
      } else {
        path = pipeline.getPath(path, { from: filename })
      }

      return factory.createStringLiteral(path, false)
    }

    return node
  }
}