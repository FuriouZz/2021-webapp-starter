import { ConfigureModules } from "./workflow/config"

ConfigureModules({

  "ejs": {
    // Toggle module loading
    enabled: true,

    // Set relative module path
    path: "modules/ejs",

    // Set package.json dependencies
    dependencies: {},

    // Set package.json devDependencies
    devDependencies: {
      "@types/lodash.template": "4.4.6",
      "lodash.template": "4.5.0",
      "front-matter": "3.0.1",
    }
  },

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

  "css": {
    // enabled: true,
    path: "modules/css",
    devDependencies: {
      "css-loader": "4.2.2",
      "extract-css-chunks-webpack-plugin": "^4.7.5"
    }
  },

  "vue": {
    enabled: true,
    path: "modules/vue",
    dependencies: {
      "vue": "2.6.12",
      "vue-router": "^3.4.3"
    },
    devDependencies: {
      "vue-loader": "15.9.3",
      "vue-template-compiler": "2.6.12"
    },
  },

  "targets": {
    // enabled: true,
    path: "modules/targets",
    devDependencies: {
      "js-yaml": "3.13.1",
    }
  },

  "aws": {
    // enabled: true,
    path: "modules/aws",
  },

  "i18n": {
    // enabled: true,
    path: "modules/i18n",
    devDependencies: {
      "@types/airtable": "^0.5.6",
      "airtable": "^0.7.2",
      "kramed": "^0.5.6",
    }
  },

  "zip": {
    // enabled: true,
    path: "modules/zip",
    devDependencies: {
      "jszip": "^3.5.0",
    }
  },

  "pre-render-spa": {
    enabled: true,
    path: "modules/pre-render-spa",
    devDependencies: {
      "prerender-spa-plugin": "3.4.0"
    }
  }

})