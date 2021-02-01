import { parse } from "lol/js/object/argv"
import { word } from "lol/js/string/generate"

async function name() {
  console.log(word(6, 6))
}

(async () => {
  const argv = parse(process.argv.slice(3))
  eval(`${argv[0]}(argv)`)
})()