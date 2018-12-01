"use strict";

var _glob = _interopRequireDefault(require("glob"));

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
} // First get all files


var filesPaths = _glob.default.sync("".concat(dir, "/**/+(*.js|*.jsx)"), {
  'ignore': ["".concat(dir, "/node_modules/**")]
}); // Get the contents of all files and parse them
// TODO this has a weird issue, need to return file path with the promise instead of using filesPaths arrays


console.log("Starting project analysis in: ".concat(dir));
(0, _utils.getFiles)(filesPaths).then(function (files) {
  // Parse files
  var data = new Map();
  files.forEach(function (file, index) {
    var parsed = (0, _utils.parseFile)(file.toString(), filesPaths[index]);

    if (parsed) {
      data.set(parsed.name, parsed);
    }
  }); // Iterate and count instances of components

  data.forEach(function (file, name) {
    //console.log(`\n\nCOMPONENT: ${name}`)
    data.forEach(function (file2, name2) {
      //console.log(`Child: ${name2}`)
      //console.log(`Tags:`, file2.tags)
      if (file2.tags.has("<".concat(name, ">"))) {
        //console.log('\nHAS\n')
        file.count++;
      }
    });
    data.set(name, file);
  }); // Output results

  console.log("\n\nAnalysis complete:");
  console.log("\nUnused components:");
  data.forEach(function (file, name) {
    if (file.count === 0) {
      console.log("".concat(name, " (").concat(file.path, ")"));
    }
  });
  console.log("\n\n");
}, function (err) {
  console.error(err);
});