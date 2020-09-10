import CSS from "./subtitle.css"
import HTML from "./flags.html.ejs"

async function main() {
  console.log(CSS, HTML)
  console.log(asset_url("flags.png"))
  document.querySelector("h2").classList.add(CSS.subtitle)
}

window.addEventListener('DOMContentLoaded', main)