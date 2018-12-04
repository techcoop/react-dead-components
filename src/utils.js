import fs from 'fs'
import { dirname } from 'path'
import Promise from 'bluebird'
import tagsJSON from './tags.json'

const baseTags = new Set(tagsJSON)
const readFile = Promise.promisify(fs.readFile)

// Gets all files with promises
export const getFiles = files => {
  return Promise.all(files.map(file => readFile(file)))
}

// Parses file for component name and rendered tags
export const parseFile = (content, path) => {

  /*
  const patterns = [
    /.*class (.*) extends (React\.)?Component/,
    /.*[const|let] (.*) \= \(?props\)? \=> /
  ]

  // TODO use default export instead? depends on how it is imported and used?
  let name
  patterns.some(pattern => {
    const matches = content.match(pattern)
    if (!matches) {
      return false
    }

    name = matches[1].trim()
    return true
  })
  */

  return {
    //name: name,
    path: path,
    count: 0,
    imports: getImports(content, dirname(path)),
    exports: getExports(content, path.replace('.jsx', '').replace('.js', '')),
    //exports: getExports(content, path),
    //components: getComponents(content)
  }
}

// Gets tags from file contents
export const getComponents = content => {
  const pattern = /(<(?!\/)([^>]+)>)/ig
  const matches = content.match(pattern)

  //baseTags
  const components = new Set()
  matches.forEach(tag => {
    const parts = tag.replace('\r', '').replace('\n', '').split(' ')
    tag = parts.length > 1 ? `${parts[0]}>` : parts[0]

    if (!baseTags.has(tag)) {
      components.add(tag)
    }
    
  })
  
  return components
}

// Gets imports from file contents
export const getImports = (content, directory) => {
  const matches = content.match(/import(?:["'\s]*([\w*{}\n\r\t, ]+)from\s*)?["'\s].*([@\w/_-]+)["'\s].*;?$/gm)
  
  let values = []
  if (!matches) {
    return values
  }

  matches.forEach(match => {
    values = values.concat(parseImport(match, directory))
  })
  
  return values
}

// Get exports from file contents
export const getExports = (content, directory) => {
  const matches = content.match(/^export\s(?:["'\s]*([\w*{}\t, ]+))?.*;?$/gm)
  
  let values = []
  if (!matches) {
    return values
  }

  matches.forEach(match => {
    values = values.concat(parseExport(match, directory))
  })

  return values
}

// Parses an export into its parts
export const parseExport = (item, directory) => {
  let parts

  if (item.includes(' extends ')) {
    item = item.split(' extends ')[0]
  }

  if (item.includes('const ')) {
    parts = item.split('const')
  }

  if (item.includes('default ')) {
    parts = item.split('default')
  }
  
  if (item.includes('class ')) {
    parts = item.split('class')
  }
  /*
  if (item.includes('function ')) {
    parts = item.split('function')
  }

  if (item.includes('from ')) {
    parts = item.split('from')
  }
  */
  let values
  if (!parts) {
    return []
  }

  if (parts[1]) {
    values = parts[1].split('=')
  } else {
    values = parts[0].split('=')
  }

  /*
  if (!parts) {
    values = item.split('=')
  } else {
    if (parts[1]) {
      values = parts[1].split('=')
    } else {
      values = parts[0].split('=')
    }
  }
  */
  let name = stripAll(values[0], [' ', ';'])

  if (name.endsWith(')')) {
    const matches = name.match(/\(\w*\)/gm)
    if (matches) {
      name = stripAll(matches[0], [' ', '\\(', '\\)'])
    }
  }

  return [`${directory}::${name}`]
}

// Parses an import into its parts
export const parseImport = (item, directory) => {
  item = stripAll(item, 'import')
  const parts = item.split('from')

  // If we have only a single part (no from)
  if (parts.length === 1) {
    return [`${buildPath(stripAll(parts[0], ['"', '\'', ';', ' ']), directory)}::*`]
  }

  // Process imports by source => value
  const source = buildPath(stripAll(parts[1], ['"', '\'', ';', ' ']), directory)
  const values = stripAll(parts[0], ['{', '}', '\r', '\n'])
  
  const imports = []
  values.split(',').forEach(item => {
    if (item.includes(' as ')) {
      const parts = item.split(' as ')
      imports.push(`${source}::${stripAll(parts[0], ' ')}`)
    } else {
      item = stripAll(item, ' ')
      imports.push(`${source}::${item}`)
    }
  })

  return imports
}

// Gets path from relative
export const buildPath = (path, basePath) => {
  if (path.startsWith('./')) {
    path = path.replace('./', '')
  }

  return `${basePath}/${path}`
}

// Strips all values in find from str
export const stripAll = (str, find) => {
  if (!str) {
    return undefined
  }

  if (Array.isArray(find)) {
    find.forEach(item => {
      str = str.replace(new RegExp(item, 'g'), '')
    })

    return str
  } else {
    return str.replace(new RegExp(find, 'g'), '')
  }
}
