// Import HTML to JS
import HTML from "./emoji.html.ejs"

// Import Styles to JS
import CSS from "./hello.styl"

async function main() {
  // Log raw HTML
  console.log(HTML)

  // Log CSS class names
  console.log(CSS)

  // Using Webpack require()
  console.log(require("../assets/emoji/emoji_u1f44b.png"))

  // Using asset_url helper
  console.log(asset_url("emoji/emoji_u1f44b.png"))

  // Require all assets starting with emoji/
  console.log(asset_filter("emoji/"))

  // If stylus.modules enabled, you have access to :local() classes
  document.querySelector("h1").classList.add(CSS.hello)
}

window.addEventListener('DOMContentLoaded', main)