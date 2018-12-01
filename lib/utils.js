"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTags = exports.parseFile = exports.hasReact = exports.getFiles = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _tags = _interopRequireDefault(require("./tags.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var baseTags = new Set(_tags.default);

var readFile = _bluebird.default.promisify(_fs.default.readFile); // Gets all files with promises


var getFiles = function getFiles(files) {
  return _bluebird.default.all(files.map(function (file) {
    return readFile(file);
  })); //return Promise.all(files.map(file => ({path: file, content: readFile(file)})))
}; // Determines if a file has react imported


exports.getFiles = getFiles;

var hasReact = function hasReact(content) {
  return content.includes('react') || content.includes('React');
}; // Parses file for component name and rendered tags


exports.hasReact = hasReact;

var parseFile = function parseFile(content, path) {
  if (!hasReact(content)) {
    return;
  }

  var patterns = [/.*class (.*) extends (React\.)?Component/, /.*[const|let] (.*) \= \(?props\)? \=> /]; // TODO use default export instead? depends on how it is imported and used?

  var name;
  patterns.some(function (pattern) {
    var matches = content.match(pattern);

    if (!matches) {
      return false;
    }

    name = matches[1].trim();
    return true;
  });

  if (!name) {
    return;
  }

  return {
    name: name,
    path: path,
    count: 0,
    tags: getTags(content)
  };
};

exports.parseFile = parseFile;

var getTags = function getTags(content) {
  var pattern = /(<(?!\/)([^>]+)>)/ig;
  var matches = content.match(pattern); //baseTags

  var tags = new Set();
  matches.forEach(function (tag) {
    var parts = tag.replace('\r', '').replace('\n', '').split(' ');
    tag = parts.length > 1 ? "".concat(parts[0], ">") : parts[0];

    if (!baseTags.has(tag)) {
      tags.add(tag);
    }
  });
  return tags;
};

exports.getTags = getTags;