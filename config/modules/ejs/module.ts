import { WK } from "../../workflow/types";
import { EJSOptions, render_template } from "./ejs-loader";
import { Dictionary } from "lodash";
import ts from "typescript";
import { ejsRule } from "./rules";
import { basename, extname } from "path";

export type Options = {
  ejs: EJSOptions & { imports: Dictionary<any> }
}


export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      ejs: {
        imports: {},
        helpers: {},
        data: {},
      }
    }
  },

  onModulesUpdate({ typescript, ejs, env, pageData, generate }) {
    const EJS_REG = /ejs/

    // Add @ejs: transform
    typescript.visitors.push((node, factory) => {
      if (ts.isCallExpression(node) && EJS_REG.test(node.expression.getText()) && node.arguments.length === 1) {
        const arg0 = node.arguments[0]

        // StringLiteral = "flags.png" | 'flags.png' (accepted)
        // NoSubstitutionTemplateLiteral = `flags.png` (accepted)
        // TemplateLiteral = `flags.${extension}` (rejected)
        // BinaryExpression = "flags" + extension | 'flags' + extension | `flags` + extension (rejected)
        const isStringLiteral = ts.isStringLiteral(arg0) || ts.isNoSubstitutionTemplateLiteral(arg0)
        if (!isStringLiteral) return node

        const source = (arg0 as ts.StringLiteral | ts.NoSubstitutionTemplateLiteral).text.trim()
        const result = render_template(`<%= ${source} %>`, ejs)
        return factory.createStringLiteral(result, false)
      }

      return node
    })

    pageData.datas.push(async data => {
      data["ejs"] = ejs.data
    })

    generate.files.push({
      filename: "ejs.d.ts",
      content() {
        let content = ""
        content += `import { PAGE } from "./${basename(pageData.filename, extname(pageData.filename))}"\n`
        content += `declare global {\n`
        content += `  export function ejs(key: string): string\n`
        content += `}\n`
        return content
      }
    })

    // Add environment
    ejs.data["env"] = {
      target: env.target,
      host: env.host,
    }
  },

  onWebpackUpdate(config) {
    config.webpack.module!.rules.unshift(ejsRule(config))
  },

}