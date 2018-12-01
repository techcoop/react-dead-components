import glob from 'glob'
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

// First get all files
const filesPaths = glob.sync(`${dir}/**/+(*.js|*.jsx)`, {'ignore': [`${dir}/node_modules/**`]})

// Get the contents of all files and parse them
// TODO this has a weird issue, need to return file path with the promise instead of using filesPaths arrays
console.log(`Starting project analysis in: ${dir}`)
getFiles(filesPaths).then(files => {
  
  // Parse files
  const data = new Map()
  files.forEach((file, index) => {
    const parsed = parseFile(file.toString(), filesPaths[index])
    if (parsed) {
      data.set(parsed.name, parsed)
    }
  })

  // Iterate and count instances of components
  data.forEach((file, name) => {
    //console.log(`\n\nCOMPONENT: ${name}`)
    data.forEach((file2, name2) => {
      //console.log(`Child: ${name2}`)
      //console.log(`Tags:`, file2.tags)
      if (file2.tags.has(`<${name}>`)) {
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
}, err => {
  console.error(err)
})
