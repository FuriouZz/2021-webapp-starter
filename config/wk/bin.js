#!/usr/bin/env node

const { build } = require("esbuild")
const { readFileSync } = require("fs")
const { dirname } = require("path")
const { parse } = require("lol/js/object/argv")

const argv = parse(process.argv.slice(2))
const pkg = JSON.parse(readFileSync("package.json", "utf-8"))

function requireContent(code, filename, context) {
  const Module = module.constructor
  const paths = Module._nodeModulePaths(dirname(filename))

  const parent = module
  const mod = new Module(filename, parent)
  mod.filename = filename
  mod.exports = context
  mod.loaded = true
  mod.paths = paths
  mod._compile(code, filename)

  const xports = mod.exports
  parent.children && parent.children.splice(parent.children.indexOf(mod), 1)

  return xports
}

(async () => {
  const result = await build({
    entryPoints: [
      argv[0]
    ],
    bundle: true,
    write: !argv.run,
    platform: "node",
    target: ["node14.9"],
    external: [
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.dependencies || {}),
    ],
    outdir: "tmp"
  })

  if (argv.run) {
    requireContent(result.outputFiles[0].text, argv[0])
  }

  if (argv.stdout) {
    console.log(result.outputFiles[0].text)
  }
})()