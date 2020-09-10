import helloStyles from "./hello.css"

async function main() {
  console.log("Hello World")
  document.querySelector("h1").classList.add(helloStyles.hello)
}

window.addEventListener('DOMContentLoaded', main)