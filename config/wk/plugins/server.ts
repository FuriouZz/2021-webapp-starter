import { PathBuilder } from "asset-pipeline/js/path";
import { dirname } from "path";
import { Plugin } from "../types";
import { getCertificate } from "../lib/server";
import * as https from "https";

export = <Plugin>{
  name: "server",

  setup(config) {
    const { runner: r, options, pipeline } = config

    r.task("serve", async () => {
      const express = (await import("express")).default
      const app = express()

      pipeline.source
        .all()
        .forEach(source => {
          app.use(express.static(source.fullpath.os()))
        })

      options.build.entries.forEach(entry => {
        const path = new PathBuilder(entry.asset.output).web()
        app.get(`/${path}`, (req, res, next) => {
          if (/\.css/.test(path)) {
            res = res.contentType("text/css")
          } else if (/\.js/.test(path)) {
            res = res.contentType("application/javascript")
          } else if (/\.html/.test(path)) {
            res = res.contentType("text/html")
          }
          res.send(entry.result)
        })

        const index_reg = /index\.html/gi

        if (index_reg.test(path)) {
          const dir = dirname(path)
          app.get(`/${dir === "." ? "" : dir}`, (req, res, next) => {
            res.contentType("text/html").send(entry.result)
          })
        }
      })

      const port = 3000
      let protocol = "http"
      if (options.env.https) {
        protocol = "https"
        const cert = getCertificate()
        https
          .createServer({
            key: cert,
            cert,
          }, app)
          .listen(port)
      } else {
        app.listen(port)
      }
      console.log(`Run server at port ${protocol}://localhost:${port}`)
    })
  }
}