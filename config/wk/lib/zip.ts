import JSZip from 'jszip'
import { createReadStream, createWriteStream } from 'fs'
import { fetch } from 'lol/js/node/fs'
import { PathBuilder } from "asset-pipeline/js/path"

export interface ZipOptions {
  input: string
  output: string
  include?: string[]
  exclude?: string[]
}

export function zip(options: ZipOptions) {
  const input = new PathBuilder(options.input)
  options.include = options.include || [ '**/*' ]
  const _include = options.include.map(f => input.join(f).toString("unix"))


  const zip = new JSZip()
  fetch(_include, options.exclude).forEach((file) => {
    zip.file(file.replace(input + '/', ''), createReadStream(file))
  })

  const outputStream = createWriteStream(options.output)

  return new Promise<void>((resolve) => {
    zip
      .generateNodeStream({ streamFiles: true })
      .pipe(outputStream)
      .on('finish', resolve)
  })
}