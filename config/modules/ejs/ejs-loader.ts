import { loader } from "webpack";
import * as Path from "path";
import * as Fs from "fs";
import template from "lodash.template";
import { TemplateOptions, Dictionary } from "lodash";
import FM from "front-matter";
import { merge } from "lol/js/object";

export type EJSHelper = (this: EJSLoaderContext) => (...args: any[]) => any

export interface EJSOptions extends TemplateOptions {
  data: any,
  helpers: Dictionary<EJSHelper>
}

export interface EJSLoaderOptions extends EJSOptions {
  extract: boolean
  esModule: boolean
}

export interface EJSLoaderContext {
  context: loader.LoaderContext,
  options: EJSLoaderOptions,
  source: string
  loadModule: (request: string) => void
}

interface IFrontMatterAttributes {
  layout: string,
  content: string,
  page: string,
  [key: string]: any
}

export function render_template(source: string, options?: Partial<EJSOptions>) {
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

function render(this: EJSLoaderContext) {
  const source = this.source
  const options = this.options
  const context = this.context

  if (!FM.test(source)) {
    return render_template(source, options)
  }

  let template: string

  // Render front-matter with data
  const fm_rendered = FM<IFrontMatterAttributes>(source)
  template = render_template(fm_rendered.frontmatter!, options)
  const fm_attrs_rendered = FM<IFrontMatterAttributes>(`---\n${template}\n---`)

  // Merge attributes with EJS data
  options.data['layout'] = null
  options.data['content'] = fm_rendered.body
  options.data['page'] = Path.basename(context.resourcePath).split('.')[0]
  options.data = merge(options.data, fm_attrs_rendered.attributes)

  if (options.data.hasOwnProperty('layout') && typeof options.data['layout'] == "string") {
    const dirname = Path.dirname(this.context.resourcePath)
    const layout_path = Path.resolve(dirname, options.data['layout'])
    this.context.addDependency(layout_path)
    const layout = Fs.readFileSync(layout_path, 'utf-8')
    template = render_template(layout, options)
  }

  return render_template(template, options)
}

function add_helpers(this: EJSLoaderContext) {
  const self = this

  const _internals = {
    include: function(path: string) {
      const dirname = Path.dirname(self.context.resourcePath)
      const resolved_path = Path.resolve(dirname, path)
      self.context.addDependency( resolved_path )
      var source = Fs.readFileSync(resolved_path, 'utf-8')
      return render_template(source, self.options)
    }
  }

  Object.keys(this.options.helpers).forEach((key) => {
    const helper = this.options.helpers[key]
    this.options.imports![key] = helper.call(self)
  })

  this.options.imports!.include = _internals.include
}

function loadModule(this: loader.LoaderContext, request) {
  return new Promise<any>((resolve, reject) => {
    this.loadModule(request, (err, source, sourceMap, module) => {
      if (err) {
        reject(err)
      } else {
        resolve({ source, sourceMap, module })
      }
    })
  })
}

export default function EJSLoader(this: loader.LoaderContext, source: string) {
  const callback = this.async()
  const modulesToLoad: string[] = []

  const options: EJSLoaderOptions = Object.assign({
    imports: {},
    helpers: {},
    data: {},
    extract: true,
    esModule: true
  }, this.query || {})

  const loader: EJSLoaderContext = {
    context: this,
    options,
    source,
    loadModule: (request) => modulesToLoad.push(request)
  }

  add_helpers.call(loader)
  const result = render.call(loader)

  const xprt = options.esModule ? "export default " : "module.exports = "

  if (modulesToLoad.length === 0) {
    callback(null, options.extract ? result : xprt + JSON.stringify(result), null)
  } else {
    const ps = modulesToLoad.map(request => loadModule.call(this, request))
    Promise.all(ps).then(() => {
      callback(null, options.extract ? result : xprt + JSON.stringify(result), null)
    }, (err) => {
      callback(err)
    })
  }
}