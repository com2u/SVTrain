var fs = require("fs");
var p = require("path");
const {promisify} = require('util')
const readdir = promisify(fs.readdir)
const lstat = promisify(fs.lstat)

// function patternMatcher(pattern) {
//   return function (path, stats) {
//     var minimatcher = new minimatch.Minimatch(pattern, {matchBase: true});
//     return (!minimatcher.negate || stats.isFile()) && minimatcher.match(path);
//   };
// }
//
// function toMatcherFunction(ignoreEntry) {
//   if (typeof ignoreEntry == "function") {
//     return ignoreEntry;
//   } else {
//     return patternMatcher(ignoreEntry);
//   }
// }
//


const readDirRecursiveSync = async function (dir) {
  let result = [dir]
  const files = await readdir(dir)
  for (const file of files) {
    const nextPath = p.join(dir, file)
    const flstat = await lstat(nextPath)
    if (flstat.isDirectory()) {
      const nextPathResult = await readDirRecursiveSync(nextPath)
      result = [...result, ...nextPathResult]
    }
  }
  return result
}


module.exports = readDirRecursiveSync;
