import { Config } from "./lib/config";

export async function CreateBuildConfig(setup: (config: Config) => any | Promise<any>) {
  const c = new Config()
  const { runner: r, options } = c

  await import("./plugins/common").then(c.plugin)
  await import("./plugins/asset").then(c.plugin)
  await import("./plugins/build").then(c.plugin)
  await import("./plugins/server").then(c.plugin)

  await c.execute("env")

  const bundle = r.group("bundle")
  bundle
    .pushBack("asset")
    .pushBack("page-data")
    .pushBack("build:prepare")
    .pushBack("i18n:fetch")
    .pushBack("generate")
    .pushBack("build:compile")

  if (!options.env.server) bundle.pushBack("build:emit")
  if (options.env.watch) bundle.pushBack("watch")
  if (options.env.server) bundle.pushBack("serve")

  await c.plugin({ name: "user", setup })
  await c.execute("bundle")

  return c
}