import glob from 'glob'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { getFiles, parseFile } from './utils'

// Make sure we have a directory parameter
const dir_index = process.argv.indexOf('--dir')
if (dir_index === -1 && dir_index + 1 <= process.argv.length) {
  console.error(`\nCould not find "--dir" flag\n`)
  process.exit()
}

const dir = process.argv[dir_index + 1]
if (!dir) {
  console.error(`\nCould not find a directory following "--dir" \n`)
  process.exit()
}

if (!existsSync(dir)) {
  console.error(`\nCould not find the directory "${dir}"\n`)
  process.exit()
}

const min_index = process.argv.indexOf('--min')
let min = 0
if (min_index !== -1 && min_index + 1 <= process.argv.length) {
  min = process.argv[min_index + 1]
}

// First get all files
const filesPaths = glob.sync(`${dir}/**/+(*.js|*.jsx)`, {'ignore': [`${dir}/node_modules/**`]})

// Get the contents of all files and parse them
// TODO this has a weird issue, need to return file path with the promise instead of using filesPaths arrays
console.log(`Starting project analysis in: ${dir}\n`)
getFiles(filesPaths).then(files => {
  
  // Parse files
  const components = new Map()
  const imports = new Map()
  const exports = new Map()

  files.forEach((file, index) => {
    const parsed = parseFile(file.toString(), filesPaths[index])
    if (!parsed) {
      return
    }

    if (parsed.exports) {
      parsed.exports.map(item => {
        item = resolve(item)
        if (exports.has(item)) {
          exports.set(item, exports.get(item) + 1)
        } else {
          exports.set(item, 1)
        }
      })
    }

    if (parsed.imports) {
      parsed.imports.map(item => {
        item = resolve(item)
        if (imports.has(item)) {
          imports.set(item, imports.get(item) + 1)
        } else {
          imports.set(item, 1)
        }
      })
    }

  })
  
  const unused = {}
  exports.forEach((count, key) => {
    if (!imports.has(key)) {
      count = 0 
    }

    if (!unused[count]) {
      unused[count] = []
    }

    unused[count].push(key)
  })

  Object.keys(unused).map((count) => {
    count = parseInt(count)
    if (count <= min) {
      console.log(`\n\nOccurences (${count})\n`)
      unused[count].map(item => {
        console.log(`${item}`)
      })
      console.log(`\n\n`)
    }
  })




  /*
  // Iterate and count instances of components
  data.forEach((file, name) => {
    //console.log(`\n\nCOMPONENT: ${name}`)
    data.forEach((file2, name2) => {
      //console.log(`Child: ${name2}`)
      //console.log(`Components:`, file2.components)
      if (file2.components.has(`<${name}>`)) {
        //console.log('\nHAS\n')
        file.count++
      }
    })

    data.set(name, file)
  })

  // Output results
  console.log(`\n\nAnalysis complete:`)
  console.log(`\nUnused components:`)
  data.forEach((file, name) => {
    if (file.count === 0) {
      console.log(`${name} (${file.path})`)
    }
  })
  console.log(`\n\n`)
  */
}, err => {
  console.error(err)
})
