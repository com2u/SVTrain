const fs = require('fs')
const fsExtra = require('fs-extra')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'public')
const distDir = path.join(__dirname, 'dist')

function emptyPublicDir() {
  if (fs.existsSync(publicDir)) {
    fsExtra.removeSync(publicDir)
  }
}

function copyDist() {
  fsExtra.copySync(distDir, publicDir)
}


function buildAndCopy() {
  emptyPublicDir()
  copyDist()
}

buildAndCopy()
