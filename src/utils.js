import fs from 'fs'
import Promise from 'bluebird'
import tagsJSON from './tags.json'

const baseTags = new Set(tagsJSON)
const readFile = Promise.promisify(fs.readFile)

// Gets all files with promises
export const getFiles = files => {
  return Promise.all(files.map(file => readFile(file)))
  //return Promise.all(files.map(file => ({path: file, content: readFile(file)})))
}

// Determines if a file has react imported
export const hasReact = content => {
  return content.includes('react') || content.includes('React')
}

// Parses file for component name and rendered tags
export const parseFile = (content, path) => {
  if (!hasReact(content)) {
    return
  }

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

  if (!name) {
    return
  }

  return {name, path, count: 0, tags: getTags(content)}
}

export const getTags = content => {
  const pattern = /(<(?!\/)([^>]+)>)/ig
  const matches = content.match(pattern)

  //baseTags
  const tags = new Set()
  matches.forEach(tag => {
    const parts = tag.replace('\r', '').replace('\n', '').split(' ')
    tag = parts.length > 1 ? `${parts[0]}>` : parts[0]

    if (!baseTags.has(tag)) {
      tags.add(tag)
    }
    
  })
  
  return tags
}
