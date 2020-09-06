# 2021-webapp-starter <!-- omit in toc -->

- [Architecture](#architecture)
- [Configure you build](#configure-you-build)
- [`typescript` module](#typescript-module)
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
* `config/config.ts` enable/disable modules
* `config/tsconfig.json` for `./config` (Updated automatically at each module activation)
* `config/workflow` Main configuration code
* `config/modules` Custom modules
* `config/modules/index.ts` Custom modules typings and imports (Updated automatically at each module activation)
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
    views.file.ignore(`**/_*.html.ejs`) // Ignore partials
    views.file.add("**/*.html.ejs", {
      output: { ext: "" },
      cache: false,
      tag: 'entry' // Required for file emission
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

    // Add copy rule
    assets.fs.copy('**/*')
  },

  // You can override webpack configuration
  webpack({ env, modules, pipeline, mainSource, webpack }) {
    webpack.mode = "production"
  }

})
```

## `typescript` module

This module enables you compile `js/ts` files.

Go to `config/config.ts` and add these lines:

```ts
  "ejs": {
    enabled: true,
    path: "modules/typescript",
    devDependencies: {
      "ts-loader": "8.0.3",
      "fork-ts-checker-webpack-plugin": "^5.1.0",
    }
  },
```

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

Example:

```ts
  if ("typescript" in modules) {
    const reg = /^@ejs:/
    // @ts-ignore
    modules.typescript.visitors.push((node, config, factory) => {
      if (
        (ts.isStringLiteral(node) || ts.isStringTextContainingNode(node))
        && reg.test(node.text)
      ) {
        let content = node.text.replace(reg, "").trim()
        content = render_template(`<%= ${content} %>`, config.modules.ejs)
        return factory.createStringLiteral(content, false)
      }
    })
  }
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

More example with `include`

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

By default, these `env` and `page` are exposed:

```ts
const target = "@ejs: env.target"
const host = "@ejs: env.host"
const env = JSON.parse("@ejs: env")
const assets = JSON.parse("@ejs: page.assets")
```

You have access to helpers too.

```ts
const assets = JSON.parse("@ejs: include('myasset.svg')")
```

const assets = JSON.parse("@ejs: page.assets")

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
  key: "key",
  category: "category",
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