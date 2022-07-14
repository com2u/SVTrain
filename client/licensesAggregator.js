const legalEagle = require('legal-eagle')
const path = require('path')
const fs = require('fs')

const clientDir = process.cwd()
const serverDir = path.resolve(__dirname, '..')

Object.filter = (obj, predicate) =>
  Object.fromEntries(Object.entries(obj).filter(predicate))

const getLicensesFromDir = async (dir) =>
  new Promise((resolve) => {
    legalEagle(
      {
        path: dir,
      },
      (err, licenses) => {
        if (err) {
          resolve({})
        } else {
          resolve(licenses)
        }
      },
    )
  })

const getAllLicenses = async () => {
  const licenses = {}
  const clientLicenses = await getLicensesFromDir(clientDir)
  const serverLicenses = await getLicensesFromDir(serverDir)
  Object.assign(licenses, clientLicenses, serverLicenses)

  fs.writeFileSync(
    path.resolve(__dirname, './licenses.json'),
    JSON.stringify(
      Object.filter(
        licenses,
        ([name, license]) => license.sourceText || license.repository,
      ),
      null,
      2,
    ),
  )
}

getAllLicenses()
