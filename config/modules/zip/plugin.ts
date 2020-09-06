import { Compiler } from "webpack"
import { zip, ZipOptions } from "./zip"

export class ZipPlugin {

  constructor(private options: ZipOptions) {
    this.apply = this.apply.bind(this)
    this.zip = this.zip.bind(this)
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tapPromise('zip', this.zip)
  }

  async zip() {
    console.log('[ZipPlugin] Zip input', this.options.input)
    await zip(this.options)
    console.log('[ZipPlugin] Output to', this.options.output)
  }

}