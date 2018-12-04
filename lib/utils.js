"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stripAll = exports.buildPath = exports.parseImport = exports.parseExport = exports.getExports = exports.getImports = exports.getComponents = exports.parseFile = exports.getFiles = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _bluebird = _interopRequireDefault(require("bluebird"));

var _tags = _interopRequireDefault(require("./tags.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var baseTags = new Set(_tags.default);

var readFile = _bluebird.default.promisify(_fs.default.readFile); // Gets all files with promises


var getFiles = function getFiles(files) {
  return _bluebird.default.all(files.map(function (file) {
    return readFile(file);
  }));
}; // Parses file for component name and rendered tags


exports.getFiles = getFiles;

var parseFile = function parseFile(content, path) {
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
    imports: getImports(content, (0, _path.dirname)(path)),
    exports: getExports(content, path.replace('.jsx', '').replace('.js', '')) //exports: getExports(content, path),
    //components: getComponents(content)

  };
}; // Gets tags from file contents


exports.parseFile = parseFile;

var getComponents = function getComponents(content) {
  var pattern = /(<(?!\/)([^>]+)>)/ig;
  var matches = content.match(pattern); //baseTags

  var components = new Set();
  matches.forEach(function (tag) {
    var parts = tag.replace('\r', '').replace('\n', '').split(' ');
    tag = parts.length > 1 ? "".concat(parts[0], ">") : parts[0];

    if (!baseTags.has(tag)) {
      components.add(tag);
    }
  });
  return components;
}; // Gets imports from file contents


exports.getComponents = getComponents;

var getImports = function getImports(content, directory) {
  var matches = content.match(/import(?:["'\s]*([\w*{}\n\r\t, ]+)from\s*)?["'\s].*([@\w/_-]+)["'\s].*;?$/gm);
  var values = [];

  if (!matches) {
    return values;
  }

  matches.forEach(function (match) {
    values = values.concat(parseImport(match, directory));
  });
  return values;
}; // Get exports from file contents


exports.getImports = getImports;

var getExports = function getExports(content, directory) {
  var matches = content.match(/^export\s(?:["'\s]*([\w*{}\t, ]+))?.*;?$/gm);
  var values = [];

  if (!matches) {
    return values;
  }

  matches.forEach(function (match) {
    values = values.concat(parseExport(match, directory));
  });
  return values;
}; // Parses an export into its parts


exports.getExports = getExports;

var parseExport = function parseExport(item, directory) {
  var parts;

  if (item.includes(' extends ')) {
    item = item.split(' extends ')[0];
  }

  if (item.includes('const ')) {
    parts = item.split('const');
  }

  if (item.includes('default ')) {
    parts = item.split('default');
  }

  if (item.includes('class ')) {
    parts = item.split('class');
  }
  /*
  if (item.includes('function ')) {
    parts = item.split('function')
  }
    if (item.includes('from ')) {
    parts = item.split('from')
  }
  */


  var values;

  if (!parts) {
    return [];
  }

  if (parts[1]) {
    values = parts[1].split('=');
  } else {
    values = parts[0].split('=');
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


  var name = stripAll(values[0], [' ', ';']);

  if (name.endsWith(')')) {
    var matches = name.match(/\(\w*\)/gm);

    if (matches) {
      name = stripAll(matches[0], [' ', '\\(', '\\)']);
    }
  }

  return ["".concat(directory, "::").concat(name)];
}; // Parses an import into its parts


exports.parseExport = parseExport;

var parseImport = function parseImport(item, directory) {
  item = stripAll(item, 'import');
  var parts = item.split('from'); // If we have only a single part (no from)

  if (parts.length === 1) {
    return ["".concat(buildPath(stripAll(parts[0], ['"', '\'', ';', ' ']), directory), "::*")];
  } // Process imports by source => value


  var source = buildPath(stripAll(parts[1], ['"', '\'', ';', ' ']), directory);
  var values = stripAll(parts[0], ['{', '}', '\r', '\n']);
  var imports = [];
  values.split(',').forEach(function (item) {
    if (item.includes(' as ')) {
      var _parts = item.split(' as ');

      imports.push("".concat(source, "::").concat(stripAll(_parts[0], ' ')));
    } else {
      item = stripAll(item, ' ');
      imports.push("".concat(source, "::").concat(item));
    }
  });
  return imports;
}; // Gets path from relative


exports.parseImport = parseImport;

var buildPath = function buildPath(path, basePath) {
  if (path.startsWith('./')) {
    path = path.replace('./', '');
  }

  return "".concat(basePath, "/").concat(path);
}; // Strips all values in find from str


exports.buildPath = buildPath;

var stripAll = function stripAll(str, find) {
  if (!str) {
    return undefined;
  }

  if (Array.isArray(find)) {
    find.forEach(function (item) {
      str = str.replace(new RegExp(item, 'g'), '');
    });
    return str;
  } else {
    return str.replace(new RegExp(find, 'g'), '');
  }
};

exports.stripAll = stripAll;