import { RuleSetRule } from "webpack"
import ts from "typescript";
import { TransformerFactory } from "./transformer";
import { WK } from "../../workflow/types";

export const tsRule = (config: WK.ProjectConfig) => {
  return {
    test: /\.(ts|tsx|js|jsx)$/i,
    include: config.webpack.context,
    use: [
      {
        loader: "ts-loader",
        options: {
          // disable type checker - we will use fork plugin
          transpileOnly: config.typescript.build !== "default",
          // onlyCompileBundledFiles: true,
          getCustomTransformers(program: ts.Program) {
            return {
              before: [
                TransformerFactory(config, program)
              ]
            }
          }
        }
      }
    ]
  } as RuleSetRule
}