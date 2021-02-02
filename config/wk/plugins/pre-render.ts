import { Plugin } from "../types";

export default <Plugin> {
  name: "pre-render",
  setup(config) {
    const { runner: r, options } = config

    r.task("prerender", () => {
      // https://github.com/puppeteer/puppeteer/blob/main/examples/custom-event.js
    })
  }
}