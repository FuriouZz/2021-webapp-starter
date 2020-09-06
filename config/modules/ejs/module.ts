import { WK } from "../../workflow/types";
import { EJSOptions, render_template } from "./loader";
import { Dictionary } from "lodash";
import ts from "typescript";

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

  modules({ typescript, ejs }) {
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
  },

  webpack({ webpack, ejs, assets, env }) {
    // Add .ejs rule
    webpack.module!.rules.unshift({
      test: /\.ejs$/i,
      enforce: "pre",
      include: webpack.context,
      use: [
        {
          loader: __dirname + "/loader.js",
          options: ejs
        }
      ]
    })

    // Add environment
    ejs.data["env"] = {
      target: env.target,
      host: env.host,
    }
  },

}