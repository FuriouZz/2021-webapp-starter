import JSZip from 'jszip'
import { createReadStream, createWriteStream } from 'fs'
import { fetch } from 'lol/js/node/fs'

export interface ZipOptions {
  input: string,
  output: string,
  exclude?: string[]
}

export function zip({ input, output, exclude } : ZipOptions) {
  const zip = new JSZip()
  fetch(input + '/**/*', exclude).forEach((file) => {
    zip.file(file.replace(input + '/', ''), createReadStream(file))
  })

  const outputStream = createWriteStream(output)

  return new Promise<never>((resolve) => {
    zip.generateNodeStream({ streamFiles: true })
    .pipe(outputStream)
    .on('finish', resolve)
  })
}