"use strict";

var _glob = _interopRequireDefault(require("glob"));

var _path = require("path");

var _fs = require("fs");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Make sure we have a directory parameter
var dir_index = process.argv.indexOf('--dir');

if (dir_index === -1 && dir_index + 1 <= process.argv.length) {
  console.error("\nCould not find \"--dir\" flag\n");
  process.exit();
}

var dir = process.argv[dir_index + 1];

if (!dir) {
  console.error("\nCould not find a directory following \"--dir\" \n");
  process.exit();
}

if (!(0, _fs.existsSync)(dir)) {
  console.error("\nCould not find the directory \"".concat(dir, "\"\n"));
  process.exit();
}

var min_index = process.argv.indexOf('--min');
var min = 0;

if (min_index !== -1 && min_index + 1 <= process.argv.length) {
  min = process.argv[min_index + 1];
} // First get all files


var filesPaths = _glob.default.sync("".concat(dir, "/**/+(*.js|*.jsx)"), {
  'ignore': ["".concat(dir, "/node_modules/**")]
}); // Get the contents of all files and parse them
// TODO this has a weird issue, need to return file path with the promise instead of using filesPaths arrays


console.log("Starting project analysis in: ".concat(dir, "\n"));
(0, _utils.getFiles)(filesPaths).then(function (files) {
  // Parse files
  var components = new Map();
  var imports = new Map();
  var exports = new Map();
  files.forEach(function (file, index) {
    var parsed = (0, _utils.parseFile)(file.toString(), filesPaths[index]);

    if (!parsed) {
      return;
    }

    if (parsed.exports) {
      parsed.exports.map(function (item) {
        item = (0, _path.resolve)(item);

        if (exports.has(item)) {
          exports.set(item, exports.get(item) + 1);
        } else {
          exports.set(item, 1);
        }
      });
    }

    if (parsed.imports) {
      parsed.imports.map(function (item) {
        item = (0, _path.resolve)(item);

        if (imports.has(item)) {
          imports.set(item, imports.get(item) + 1);
        } else {
          imports.set(item, 1);
        }
      });
    }
  });
  var unused = {};
  exports.forEach(function (count, key) {
    if (!imports.has(key)) {
      count = 0;
    }

    if (!unused[count]) {
      unused[count] = [];
    }

    unused[count].push(key);
  });
  Object.keys(unused).map(function (count) {
    count = parseInt(count);

    if (count <= min) {
      console.log("\n\nOccurences (".concat(count, ")\n"));
      unused[count].map(function (item) {
        console.log("".concat(item));
      });
      console.log("\n\n");
    }
  });
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
}, function (err) {
  console.error(err);
});