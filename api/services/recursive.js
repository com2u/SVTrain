var fs = require("fs");
const Env = use('Env');
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
  // Legacy code didnt delete for reference. 
  let result = Env.get('ROOT_PATH') === dir ? [] : [dir]
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

const readDirOptimal = async function (dir) {
  /*
    readDirOptimal is the optimal version of the readDirRecursiveSync. 
    Instead of going through every file and check if they are directories or not it just 
    filters files that are not directories using the file types. Then it calls itself recursively
    to go in the directories deeper. Immensely more time efficient.  
  */
  let result = Env.get('ROOT_PATH') === dir ? [] : [dir]
  const files = await readdir(dir, { withFileTypes: true });
  const directories = files.filter(file => file.isDirectory()).map(file => file.name);
  for (const folder of directories) {
    const nextPath = p.join(dir, folder)
    const nextPathResult = await readDirOptimal(nextPath)
    result = [...result, ...nextPathResult]
  }
  return result
}


module.exports = readDirOptimal;
