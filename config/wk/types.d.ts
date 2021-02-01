import { LoadOptions, Data } from "./lib/airtable";
import { FileCreatorEntry } from "./lib/file-creator";
import { PageDataFunction } from "./lib/page-data";
import { DeployOptions as AWSDeployOptions } from "./lib/aws";
import { EJSOptions as EJSOpts } from "./lib/ejs";
import { Config } from "./lib/config";
import { IAssetWithSource } from "asset-pipeline/js/types";
import { FSWatcher } from "fs";

export interface Plugin {
  name: string
  setup?: (config: Config) => any | Promise<any>
}

export interface EJSOptions extends EJSOpts { }

export interface DeployOptions {
  include: string[]
  exclude: string[]
  ftp: {
    output: string
  }
  aws: Omit<AWSDeployOptions, "input">
}

export interface EnvOptions {
  target: string
  watch: boolean
  reload: boolean
  compress: boolean
  host: string
  https: boolean
  cache: boolean
  output: string
  server: boolean
}

export interface TargetOptions {
  path: string
  target: string
}

export interface PageDataOptions {
  datas: PageDataFunction[]
}

export interface GenerateOptions {
  files: FileCreatorEntry[]
}

export interface StylusOptions {
  use: ((styl: any) => void)[]
  sourcemap?: string
	import?: string[]
	include?: string[]
	define?: [string, string | number | number[] | string[] | boolean | object | ((...args: any[]) => any)]
}

export interface I18nOptions extends LoadOptions {
  locales: Record<string, Data>
}

type RenderedRoute = {
  route: string, // Where the output file will end up (relative to outputDir)
  originalRoute: string, // The route that was passed into the renderer, before redirects.
  html: string, // The rendered HTML for this route.
  outputPath: string // The path the rendered HTML will be written to.
}

export interface PreRenderSPAOptions {
  // The path your rendered app should be output to. (Defaults to assets.resolve.output())
  outputDir?: string

  // The location of index.html
  indexPath?: string

  // Routes to render
  routes: string[],

  /**
   * Allows you to customize the HTML and output path before
   * writing the rendered contents to a file.
   * renderedRoute can be modified and it or an equivelant should be returned.
   */
  postProcess?: (renderedRoute: RenderedRoute) => RenderedRoute

  // Uses html-minifier (https://github.com/kangax/html-minifier)
  // To minify the resulting HTML.
  // Option reference: https://github.com/kangax/html-minifier#options-quick-reference
  minify?: {
    collapseBooleanAttributes: boolean,
    collapseWhitespace: boolean,
    decodeEntities: boolean,
    keepClosingSlash: boolean,
    sortAttributes: boolean
  },

  // Server configuration options.
  server?: {
    // Normally a free port is autodetected, but feel free to set this if needed.
    port: number

    // Proxy configuration. Has the same signature as webpack-dev-server
    proxy: any
  },

  renderer?: {
    // The number of routes allowed to be rendered at the same time. Useful for breaking down massive batches of routes into smaller chunks. (Default: 0)
    maxConcurrentRoutes?: number
    // An object to inject into the global scope of the rendered page before it finishes loading. Must be JSON.stringifiy-able. The property injected to is window['__PRERENDER_INJECTED'] by default.
    inject?: any
    // The property to mount inject to during rendering. (Default: __PRERENDER_INJECTED)
    injectProperty?: string
    // Wait to render until the specified event is fired on the document. (You can fire an event like so: document.dispatchEvent(new Event('custom-render-trigger'))
    renderAfterDocumentEvent?: string
    // Wait to render until the specified element is detected using document.querySelector
    renderAfterElementExists?: string
    // Wait to render until a certain amount of time has passed.
    renderAfterTime?: number
    // Automatically block any third-party requests. (This can make your pages load faster by not loading non-essential scripts, styles, or fonts.) (Default: false)
    skipThirdPartyRequests?: boolean
    // Allows you to provide a custom console.* handler for pages. Argument one to your function is the route being rendered, argument two is the Puppeteer ConsoleMessage object.
    consoleHandler?: () => {}
    headless?: boolean
    executablePath?: string
  }
}

export interface BuildOptionsEntry {
  input: string
  output: string
  result: string
  asset: IAssetWithSource
  build: () => Promise<boolean>
  emit: () => Promise<boolean>
  watch: () => Promise<void>
  watcher?: FSWatcher
}

export interface BuildOptions {
  entries: BuildOptionsEntry[]
}

export interface ProjectOptions {
  ejs: EJSOptions
  stylus: StylusOptions
  pageData: PageDataOptions
  generate: GenerateOptions
  deploy: DeployOptions
  env: EnvOptions
  target: TargetOptions
  i18n: I18nOptions
  preRenderSPA: PreRenderSPAOptions
  build: BuildOptions
}