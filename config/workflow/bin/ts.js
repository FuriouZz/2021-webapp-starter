const ts = require("typescript");
const { readFileSync } = require("fs");
const { normalize } = require("path");
const { spawnSync } = require("child_process");

/**
 *
 * @param {ts.Diagnostic[]} diagnostics
 */
function readDiagnostics(diagnostics) {
  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  })
}

/**
 *
 * @param {string} file
 */
function transpile(file) {
  const source = readFileSync(file, { encoding: "utf-8" })
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
  readDiagnostics(result.diagnostics)
  return result
}

/**
 * @param {string[]} rootNames
 */
function compile(rootNames) {
  rootNames = rootNames.map(normalize)

  const options = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ESNext,
    rootDir: "./config",
    outDir: "./tmp",
    esModuleInterop: true,
    skipLibCheck: true,
    downlevelIteration: true
  }

  const output = {}

  const host = ts.createCompilerHost(options)
  const writeFile = host.writeFile
  host.writeFile = (fileName, content, writeByteOrderMark, onError, sourceFiles) => {
    const source = sourceFiles.map(s => normalize(s.fileName))[0]
    if (rootNames.includes(source)) {
      output[source] = fileName
    }
    writeFile(fileName, content, writeByteOrderMark, onError, sourceFiles)
  }

  const program = ts.createProgram({
    options,
    rootNames,
    host,
  })

  const result = program.emit()
  readDiagnostics(result.diagnostics)
  return { result, output }
}

function main() {
  const argv = process.argv.slice(2)
  const command = argv.shift()

  let exitCode = 0

  if (!command) {
    let help = 'List of commands'
    help += '\n * transpile'
    help += '\n * compile'
    help += '\n * run'
    console.log(help)
  }

  switch (command) {
    case "transpile":
      {
        if (argv.length === 0) {
          exitCode = 1
        } else {
          const result = transpile(argv[0])
          console.log(result.outputText)
        }
        break
      }
    case "compile":
      {
        if (argv.length === 0) {
          exitCode = 1
        } else {
          const { result } = compile(argv)
          exitCode = result.emitSkipped ? 1 : 0
        }
        break
      }
    case "run":
      {
        if (argv.length === 0) {
          exitCode = 1
        } else {
          const { result, output } = compile(argv)
          for (let file of argv) {
            file = normalize(file)
            if (output[file]) {
              const { status } = spawnSync(`node ${output[file]}`, { stdio: "inherit", shell: true, })
              if (status != 0) {
                exitCode = status
                break
              }
            }
          }
        }
      }
  }

  // console.log(`\nProcess exiting with code '${exitCode}'.`)
  process.exit(exitCode)
}

main()