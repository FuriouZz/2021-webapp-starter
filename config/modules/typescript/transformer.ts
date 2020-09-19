import ts from "typescript";
import { WK } from "../../workflow/types";

export type Visitor = (node: ts.Node, factory: ts.NodeFactory) => ts.Node

export function TransformerFactory(config: WK.ProjectConfig, program: ts.Program) {
  return function AssetTransformer(context: ts.TransformationContext) {
    function visitor(node: ts.Node): ts.Node {
      const items = config.typescript.visitors

      for (const item of items) {
        const result = item(node, context.factory)
        if (!result) throw new Error("[typescript] Node is missing")
        if (result !== node) return result
      }

      return ts.visitEachChild(node, visitor, context)
    }

    return function visit(node: ts.Node) {
      return ts.visitNode(node, visitor)
    }
  }
}
