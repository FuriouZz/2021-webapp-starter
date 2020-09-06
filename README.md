# 2021-webapp-starter <!-- omit in toc -->

- [Architecture](#architecture)
- [Configure you build](#configure-you-build)
- [`typescript` module (default module)](#typescript-module-default-module)
- [`asset-pipeline` module (default module)](#asset-pipeline-module-default-module)
- [`file-generator` module (default module)](#file-generator-module-default-module)
- [`page-data` module (default module)](#page-data-module-default-module)
- [`html` module (default module)](#html-module-default-module)
- [`ejs` module](#ejs-module)
  - [Default `helpers`](#default-helpers)
  - [Create a layout](#create-a-layout)
  - [With `typescript` transformer](#with-typescript-transformer)
- [`stylus` module](#stylus-module)
- [`i18n` module](#i18n-module)
- [`zip` module](#zip-module)
- [`aws` module](#aws-module)

## Architecture

* `app/**/*` all your assets and entries for your website
* `tsconfig.json` for app/
* `config/build.ts` configure build configuration
* `config/modules.ts` enable/disable modules
* `config/tsconfig.json` for `./config` (Updated automatically at each module activation)
* `config/workflow` Main configuration code
* `config/modules` Custom modules
* `config/modules/modules.ts` Custom modules typings and imports (Updated automatically at each module activation)
* `config/workflow/modules` Default modules
* `config/workflow/modules/modules.ts` Default modules typings and imports
* `.env` ini file for your environment variable (git ignored)
* `package.json` (Updated automatically at each module activation)

## Configure you build

Open your `config/build.ts` file

```ts
import { CreateWebpackConfig } from "./workflow/build";

export default CreateWebpackConfig({

  // With this hook, you can override env variable
  env({ env, modules }) {
    env.watch = true
  },

  // With this hook, you can override module options
  modules({ env, modules }) {
    modules.typescript.build = "fast"
    modules.i18n.tables["i18n"] = {
      appId: process.env['AIRTABLE_APP_ID'],
      view: "All",
      tabs: [ "I18n" ],
      flatten: true,
    }
  },

  // With this hook, you set your file entries and assets to resolve and copy
  assets({ env, modules, pipeline, mainSource }) {
    // Change output
    pipeline.resolve.output("public")

    // Typescript
    const script = pipeline.source.add("app/scripts")
    script.file.add("main.ts", {
      output: { ext: ".js" },
      cache: env.cache,
      tag: 'entry',
    })

    // Styles
    const styles = pipeline.source.add("app/styles")
    styles.file.add("main.styl", {
      output: { ext: ".css" },
      cache: env.cache,
      tag: 'entry'
    })

    // Views
    const views = pipeline.source.add("app/views")
    views.file.ignore(`**/_*.ejs`) // Ignore partials
    views.file.add("**/*.ejs", {
      output: { ext: ".html" },
      cache: false,
      tag: 'html'
    })

    // Assets
    const assets = pipeline.source.add("app/assets")
    assets.file.add("**/*", {
      output: { dir: "assets/#{output.dir}" },
      cache: env.cache ? {
        dir: "assets/#{output.dir}",
        name: "#{output.name}-#{output.hash}",
      } : false,
      tag: "asset",
    })
  },

  // You can override webpack configuration
  webpack({ env, modules, pipeline, mainSource, webpack }) {
    webpack.mode = "production"
  }

})
```

## `typescript` module (default module)

This module enables you compile `js/ts` files.

Options available:

```ts
type Options = {
  typescript: {
    /**
     * "default" - Only use ts-loader (default value)
     * "transpile" - Transpile typescript code, but does not type check. This option speed up build time
     * "fast" - Transpile typescript code and use fork-ts-checker-webpack-plugin for type-checking
     */
    build: "default" | "transpile" | "fast",

    // You have a access to the transformer and create your own node like the string "@ejs:", "@asset_path:" or "@asset_url:"
    visitors: Visitor[]
  }
}

type Visitor = (node: ts.Node, config: WK.ProjectConfig, factory: ts.NodeFactory) => ts.Node | undefined
```

Example from `asset-pipeline` module:

```ts
// ...

  modules({ typescript, ejs, assets }) {
    typescript.visitors.push((node, factory) => {
      if (ts.isCallExpression(node) && /asset_(url|path)/.test(node.expression.getText()) && node.arguments.length === 1) {
        const { pipeline } = assets
        const arg0 = node.arguments[0]

        // StringLiteral = "flags.png" | 'flags.png' (accepted)
        // NoSubstitutionTemplateLiteral = `flags.png` (accepted)
        // TemplateLiteral = `flags.${extension}` (rejected)
        // BinaryExpression = "flags" + extension | 'flags' + extension | `flags` + extension (rejected)
        const isStringLiteral = ts.isStringLiteral(arg0) || ts.isNoSubstitutionTemplateLiteral(arg0)
        if (!isStringLiteral) return node

        let path = (arg0 as ts.StringLiteral | ts.NoSubstitutionTemplateLiteral).text.trim()
        const fileName = node.getSourceFile().fileName

        // Check if the asset exist in asset-pipeline
        const asset = pipeline.manifest.get(path)

        // If the asset does not exist, return given path
        if (!asset) return ts.createStringLiteral(path)
        const source = pipeline.source.get(asset.source.uuid)

        // If the source does not exist, return given path
        if (!source) return ts.createStringLiteral(path)

        // Else replace asset_path()/asset_url() by require() and file-loader do the rest
        path = relative(dirname(fileName), source.fullpath.join(path).raw())
        const id = factory.createIdentifier("require")
        const lit = ts.createStringLiteral(path)
        return factory.createCallExpression(id, [], [lit])
      }

      return node
    })
  }

// ...
```

Now this code :

`main.ts`
```ts
const target = "@ejs: env.target";
```

will render this one

`main.js`
```ts
const target = "development";
```

## `asset-pipeline` module (default module)

Options available:

```ts
type Options = {
  assets: {
    pipeline: Pipeline,
    appSource: Source,
    rules: {
      file: RuleSetConditions,
      raw: RuleSetConditions,
    }
  }
}

type RuleSetConditions = string | RegExp | ((path: string) => boolean)
```

## `file-generator` module (default module)

This module generate files. By default the `output` is `scripts/generated`.

Options available:

```ts
type Options = {
  generate: {
    output: string,
    files: FileData[]
  }
}

type FileData = {
  filename: string,
  content: () => Promise<string> | string
}
```

Example from `asset-pipeline` module:

```ts
// ...

  modules(config) {
    config.generate.files.push({
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
    })
  }

// ...
```

## `page-data` module (default module)

This module append data to `PAGE` variable. This module works with `file-generator` to create `scripts/generated/PAGE.ts`.

Options available:

```ts
type Options = {
  pageData: {
    filename: string,
    datas: PageDataFunction[]
  }
}

type PageDataFunction = (data: Record<string, any>, config: WK.ProjectConfig) => Promise<void>
```

Example from `asset-pipeline` module :

```ts
// ...

  modules({ assets }) {
    config.pageData.datas.push(async (data) => {
      assets.pipeline.fetch(true)
      const entries = Object.entries(assets.pipeline.manifest.export("output_key"))
      const outputs: Record<string, { path: string, url: string }> = {}
      for (const [key, value] of entries) {
        outputs[key] = value.output
      }
      data["assets"] = outputs
    })
  }

// ...
```

## `html` module (default module)

This module handles every entry with `tag: "html"`. It takes care to inject scripts and styles for you and a couple more things. If you want to resolve URLs, replace your `.html` file to `.ejs` file and `<%= asset_path(key) %>` or `<%= asset_url(key) %>`.

Options available:

```ts
type Options = {
  html: {
    configure?: (input: string, options: HTMLWebpackPluginOptions) => HTMLWebpackPluginOptions
  }
}

type HTMLWebpackPluginOptions ={
  /**
   * Emit the file only if it was changed.
   * @default true
   */
  cache: boolean;
  /**
   * List all entries which should be injected
   */
  chunks: "all" | string[];
  /**
   * Allows to control how chunks should be sorted before they are included to the html.
   * @default 'auto'
   */
  chunksSortMode:
    | "auto"
    | "manual"
    | (((entryNameA: string, entryNameB: string) => number));
  /**
   * List all entries which should not be injected
   */
  excludeChunks: string[];
  /**
   * Path to the favicon icon
   */
  favicon: false | string;
  /**
   * The file to write the HTML to.
   * Supports subdirectories eg: `assets/admin.html`
   * @default 'index.html'
   */
  filename: string;
  /**
   * If `true` then append a unique `webpack` compilation hash to all included scripts and CSS files.
   * This is useful for cache busting
   */
  hash: boolean;
  /**
   * Inject all assets into the given `template` or `templateContent`.
   */
  inject:
    | false // Don't inject scripts
    | true // Inject scripts into body
    | "body" // Inject scripts into body
    | "head" // Inject scripts into head
  /**
   * Set up script loading
   * blocking will result in <script src="..."></script>
   * defer will result in <script defer src="..."></script>
   *
   * @default 'blocking'
   */
  scriptLoading:
    | "blocking"
    | "defer"
  /**
   * Inject meta tags
   */
  meta:
    | false // Disable injection
    | {
        [name: string]:
          | string
          | false // name content pair e.g. {viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'}`
          | { [attributeName: string]: string | boolean }; // custom properties e.g. { name:"viewport" content:"width=500, initial-scale=1" }
      };
  /**
   * HTML Minification options accepts the following values:
   * - Set to `false` to disable minifcation
   * - Set to `'auto'` to enable minifcation only for production mode
   * - Set to custom minification according to
   * {@link https://github.com/kangax/html-minifier#options-quick-reference}
   */
  minify: 'auto' | boolean | MinifyOptions;
  /**
   * Render errors into the HTML page
   */
  showErrors: boolean;
  /**
   * The `webpack` require path to the template.
   * @see https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md
   */
  template: string;
  /**
   * Allow to use a html string instead of reading from a file
   */
  templateContent:
    | false // Use the template option instead to load a file
    | string
    | ((templateParameters: { [option: string]: any }) => (string | Promise<string>))
    | Promise<string>;
  /**
   * Allows to overwrite the parameters used in the template
   */
  templateParameters:
    | false // Pass an empty object to the template function
    | ((
        compilation: any,
        assets: {
          publicPath: string;
          js: Array<string>;
          css: Array<string>;
          manifest?: string;
          favicon?: string;
        },
        assetTags: {
          headTags: HtmlTagObject[];
          bodyTags: HtmlTagObject[];
        },
        options: ProcessedOptions
      ) => { [option: string]: any } | Promise<{ [option: string]: any }>)
    | { [option: string]: any };
  /**
   * The title to use for the generated HTML document
   */
  title: string;
  /**
   * Enforce self closing tags e.g. <link />
   */
  xhtml: boolean;
  /**
   * In addition to the options actually used by this plugin, you can use this hash to pass arbitrary data through
   * to your template.
   */
  [option: string]: any;
}
```

Example from `asset-pipeline` module :

```ts
// ...

  modules({ assets }) {
    config.pageData.datas.push(async (data) => {
      assets.pipeline.fetch(true)
      const entries = Object.entries(assets.pipeline.manifest.export("output_key"))
      const outputs: Record<string, { path: string, url: string }> = {}
      for (const [key, value] of entries) {
        outputs[key] = value.output
      }
      data["assets"] = outputs
    })
  }

// ...
```


## `ejs` module

This module enables you compile `.ejs` files.

Go to `config/config.ts` and add these lines:

```ts
  "ejs": {
    // enabled: true,
    path: "modules/ejs",
    devDependencies: {
      "@types/lodash.template": "4.4.6",
      "lodash.template": "4.5.0",
      "front-matter": "3.0.1",
    }
  },
```

Options available:

```ts
type Options = {
  ejs: {
    imports: Record<string, any>,
    helpers: Record<string, any>,
    data: any,
  }
}
```

### Default `helpers`

Three helpers are included:

* `<%= asset_path("myasset.jpg") %>` print relative asset path (eg.: "assets/myassets.jpg")
* `<%= asset_url("myasset.jpg") %>` print asset url if `host` is given (eg.: "https://mywebsite.com/assets/myassets.jpg")
* `<%= include("myasset.svg") %>` print the content of the file

Example with `include`

```html
<!-- layout.html.ejs -->
<div>
  <header>
    <%= include("_header.html.ejs") %>
  </header>
</div>

<!-- _header.html.ejs -->
<h1>Hello world</h1>
```

### Create a layout

The ejs loader support front-matter.

`_layout.html.ejs`
```html
<html>
  <head>
    <title>My Website - <%= title %></title>
  </head>
  <body class="page-<%= page %>">
    <%= content %>
  </body>
</html>
```

`index.html.ejs`
```html
title: Home
layout: _layout.html.ejs
---
<div class="<%= page %>">Welcome home</div>
```

```html
<html>
  <head>
    <title>My Website - Home</title>
  </head>
  <body class="page-index">
    <div class="index">Welcome home</div>
  </body>
</html>
```

### With `typescript` transformer

If `typescript` is enabled, you can access data from the transform `@ejs`

For example, this string:

```ts
const target = "@ejs: env.target"
```

will be rendered as below after compilation

```ts
const target = "development"
```

If I set `env.target = "release"` in my build config

```ts
const target = "release"
```

By default, these `env` is exposed:

```ts
const target = "@ejs: env.target"
const host = "@ejs: env.host"
const env = JSON.parse("@ejs: env")
```

You have access to helpers too.

```ts
const assets = JSON.parse("@ejs: include('myasset.svg')")
```

## `stylus` module

This module enables you compile `.styl` files.

Go to `config/config.ts` and add these lines:

```ts
  "stylus": {
    enabled: true,
    path: "modules/stylus",
    devDependencies: {
      "@types/stylus": "^0.48.33",
      "stylus": "^0.54.8",
      "stylus-loader": "^3.0.2",
      "css-loader": "4.2.2",
      "extract-css-chunks-webpack-plugin": "^4.7.5"
    }
  },
```

## `i18n` module

This module enables you import locale data from an Airtable.

Go to `config/config.ts` and add these lines:

```ts
  "i18n": {
    enabled: true,
    path: "modules/i18n",
    devDependencies: {
      "@types/airtable": "^0.5.6",
      "airtable": "^0.7.2",
      "kramed": "^0.5.6",
    }
  },
```

Options available:

```ts
type Options = {
  i18n: {
    // Airtable API key
    apiKey: string,

    // Fetch locales remotely
    fetch: boolean

    // List of tables to fetch
    tables: Record<string, Table>

    // List of locales fetched
    locales: Record<string, Data>
  }
}

type Data = {
  [key: string]: Record<string, string> | Record<string, Record<string, string>>
}

type Table = {
  // App ID of the table
  appId: string,

  // Set one or more tabs
  tabs: string[],

  // Table view (must be the same for all tabs)
  view: string,

  // Key colum (must be the same for all tabs)
  key?: string,

  // Category colum (must be the same for all tabs)
  category?: string,

  // If you want to emit a json file
  output?: string,

  // Columns to ignore
  ignoreColumns?: string[],

  // Flatten data or not
  flatten?: boolean
}
```

Here an example with few entries and below the json rendered.

| key   | category | description              | en-gb    | fr-fr     |
| ----- | -------- | ------------------------ | -------- | --------- |
| title | metadata | The title of the website | My title | Mon titre |
| lang  | metadata |                          | en-gb    | fr-fr     |
| year  | footer   |                          | 2021     | 2021      |

```ts
modules.i18n.tables["demo"] = {
  appId: process.env["AIRTABLE_APP_ID"],
  tabs: [ "Demo" ],
  view: "Raw",
  key: "key", // By default is added to the ignoreColumns field
  category: "category", // By default is added to the ignoreColumns field
  ignoreColumns: [ "description" ]
}
```

```ts
// flatten: true
{
  "demo": {
    "en-gb": {
      "metadata.title": "My title",
      "metadata.lang": "en-gb",
      "footer.year": "2021"
    },
    "fr-fr": {
      "metadata.title": "Mon titre",
      "metadata.lang": "fr-fr",
      "footer.year": "2021"
    }
  }
}

// flatten: false
{
  "demo": {
    "en-gb": {
      "metadata": {
        "title": "My title",
        "lang": "en-gb",
      },
      "footer": {
        "year": "2021"
      }
    },
    "fr-fr": {
      "metadata": {
        "title": "Mon titre",
        "lang": "fr-fr",
      },
      "footer": {
        "year": "2021"
      }
    }
  }
}
```

## `zip` module

This module enables you to make a zip of your bundle after compilation.

Go to `config/config.ts` and add these lines:

```ts
  "zip": {
    enabled: true,
    path: "modules/zip",
    devDependencies: {
      "jszip": "^3.5.0",
    }
  },
```

Options available:

```ts
type Options = {
  zip: {
    // Enable zip at the end of webpack compilation
    enabled: boolean,

    // File/directory pattern to exclude
    exclude?: string[],
  }
}
```

## `aws` module

This module enables you gzip and upload to an S3 bucket. This module was only tested on OSX.

`aws-cli` command line is required.

Go to `config/config.ts` and add these lines:

```ts
  "aws": {
    enabled: true,
    path: "modules/aws",
  },
```

Options available:

```ts
type Options = {
  aws: {
    // Enable deployment after compilation
    enabled: boolean

    // Does not execute any command, only prints
    debug?: boolean

    // AWS things
    profile?: string
    region?: string
    bucket: string
    cloudfront?: InvalidationOption
    exceptions?: Record<string, ObjectDescription>
  }
}

interface ObjectDescription {
  contentType: string,
  contentEncoding: string
}

interface InvalidationOption {
  profile?: string
  region?: string
  debug?: boolean
  distribution_id: string
  paths: string[]
}
```