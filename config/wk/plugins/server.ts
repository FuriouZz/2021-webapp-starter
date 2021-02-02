import { PathBuilder } from "asset-pipeline/js/path";
import { dirname } from "path";
import { Plugin } from "../types";
import { getCertificate } from "../lib/server";
import * as https from "https";
import { NC } from "../lib/notification-center";

async function livereload(app) {
  const { Server } = (await import("ws")).default
  const port = 3001
  const server = new Server({ port })
  console.log(`[server] Web socket: ws://localhost:${port}`)
  console.log(`[server] Do not forget to add <script src="/livereload.js"></script>`)

  server.on("connection", ws => {
    ws.send(JSON.stringify({ event: "connected" }))
    NC.once("compiled", () => {
      ws.send(JSON.stringify({ event: "reload" }))
    })
  })

  app.get("/livereload.js", (req, res, next) => {
    const response = `(()=>{
      const socket = new WebSocket('ws://localhost:${port}');
      socket.addEventListener('open', function (event) {
        socket.send('Hello Server!');
      });
      socket.addEventListener('message', function (e) {
        const { event } = JSON.parse(e.data)
        switch (event) {
          case "connected": {
            console.log("[livereload] connected")
            break
          }
          case "reload": {
            console.log("[livereload] Start reloading...")
            window.location.reload()
            break
          }
        }
      });
    })()`
    res.contentType("application/javascript").send(response)
  })
}

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
      console.log(`[server] Web server: ${protocol}://localhost:${port}`)

      await livereload(app)
    })
  }
}