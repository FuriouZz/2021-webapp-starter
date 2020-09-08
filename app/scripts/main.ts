import CSS from "./subtitle.css"

async function main() {
  console.log(asset_url("flags.png"))
  document.querySelector("h2").classList.add(CSS.subtitle)
}

window.addEventListener('DOMContentLoaded', main)