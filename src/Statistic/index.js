const { promisify } = use('Helpers')
const fs = promisify(require('fs'))
const path = require('path')

module.exports = class Statistic {
  constructor () {
    this._path = path.join( __dirname, '../../', 'statistic.data')
    this._data = {}
  }

  async init() {
    if ( !fs.existsSync(this._path) ) {
      console.log(this._path)
      console.log('Statistic file doesn\'t exist')
      return
    }

    let data = await fs.readFile(this._path, 'utf8')
    try { data = JSON.parse(data) }
    catch (e) { 
      console.log('Error occured when parse statistic data')
      console.log(e)
      return 
    }

    this._data = data
  }

  get( path ) {
    return this._data[path]
    ? this._data[path]
    : {
      calculated: false
    }
  }

  async save() {
    const data = JSON.stringify( this._data, null, 2 )
    return await fs.writeFile(this._path, data, 'utf8')
  }

  write( path, { missed, matched, missmatched } ) {
    this._data[path] = {
      calculated: true,
      missed,
      matched, 
      missmatched
    }
  }
}