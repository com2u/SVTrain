const fs = require('fs')
const fsExtra = require('fs-extra')
const path = require('path')
const { promisify } = require('util')

const exists = promisify(fs.exists)
const copy = promisify(fsExtra.copy)

const publicDir = path.join(__dirname, '..', 'public')
const distDir = path.join(__dirname, 'dist')

async function emptyPublicDir() {
  if (await exists(publicDir)) {
    await fsExtra.remove(publicDir)
  }
}

function copyDist() {
  return copy(distDir, publicDir)
}

function buildAndCopy() {
  emptyPublicDir().then(() => copyDist())
}

buildAndCopy()
