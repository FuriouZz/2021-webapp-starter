import { WK } from "../../workflow/types";
import { EJSOptions, render_template } from "./ejs-loader";
import { Dictionary } from "lodash";
import ts from "typescript";
import { ejsRule } from "./rules";

export type Options = {
  ejs: EJSOptions & { imports: Dictionary<any> }
}

const EJS_REG = /^@ejs:/

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

  onModulesUpdate({ typescript, ejs, env }) {
    // Add @ejs: transform
    typescript.visitors.push((node, factory) => {
      if (
        (ts.isStringLiteral(node) || ts.isStringTextContainingNode(node))
        && EJS_REG.test(node.text)
      ) {
        let content = node.text.replace(EJS_REG, "").trim()
        content = render_template(`<%= ${content} %>`, ejs)
        return factory.createStringLiteral(content, false)
      }

      return node
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