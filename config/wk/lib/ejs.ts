import * as Path from "path";
import * as Fs from "fs";
import template from "lodash.template";
import { TemplateOptions } from "lodash";
import FM from "front-matter";
import { merge } from "lol/js/object";

export type EJSHelper = (options: EJSOptions & { filename?: string }) => (...args: any[]) => any

export interface EJSOptions extends TemplateOptions {
  helpers?: Record<string, EJSHelper>
  data?: Record<any, any>
}

interface IFrontMatterAttributes {
  layout: string,
  content: string,
  page: string,
  [key: string]: any
}

function _render(source: string, options?: Partial<EJSOptions>) {
  const opts = Object.assign({
    data: {},
    helpers: {}
  }, options || {})
  return template(source, {
    escape: opts.escape,
    evaluate: opts.evaluate,
    imports: opts.imports,
    interpolate: opts.interpolate,
    sourceURL: opts.sourceURL,
    variable: opts.variable
  })(opts.data)
}

function _helpers(options: EJSOptions, filename?: string) {
  options.imports = options.imports || {}

  Object.keys(options.helpers).forEach((key) => {
    const helper = options.helpers[key]
    options.imports[key] = helper({
      filename,
      ...options
    })
  })

  // Add include helpers
  if (filename && typeof filename === "string") {
    const _internals = {
      include: (path: string) => {
        const dirname = Path.dirname(filename)
        const resolved_path = Path.resolve(dirname, path)
        // self.context.addDependency(resolved_path)
        var source = Fs.readFileSync(resolved_path, 'utf-8')
        return _render(source, options)
      }
    }

    options.imports.include = _internals.include
  }
}

export function ejs(options: EJSOptions, source: string, filename?: string) {
  options.data = options.data || {}
  options.helpers = options.helpers || {}

  _helpers(options, filename)

  if (!FM.test(source)) {
    return _render(source, options)
  }

  let template: string

  // Render front-matter with data
  const fm_rendered = FM<IFrontMatterAttributes>(source)
  template = _render(fm_rendered.frontmatter!, options)
  const fm_attrs_rendered = FM<IFrontMatterAttributes>(`---\n${template}\n---`)

  // Merge attributes with EJS data
  options.data['layout'] = null
  options.data['content'] = fm_rendered.body
  options.data['page'] = Path.basename(filename).split('.')[0]
  options.data = merge(options.data, fm_attrs_rendered.attributes)

  if (options.data.hasOwnProperty('layout') && typeof options.data['layout'] == "string") {
    const dirname = Path.dirname(filename)
    const layout_path = Path.resolve(dirname, options.data['layout'])
    // this.context.addDependency(layout_path)
    const layout = Fs.readFileSync(layout_path, 'utf-8')
    template = _render(layout, options)
  }

  return _render(template, options)
}