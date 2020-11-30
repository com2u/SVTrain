'use strict';
const Env = use('Env');
const Drive = use('Drive');
const { promisify } = require('util');
const fs = require('fs');


const rootPath = Env.get('ROOT_PATH');

class FileController {
  async download({ params, response }) {
    const filePath = decodeURI(params.filePath.join('/'));
    console.log(`Requested file path: ${filePath}`)
    const isExist = await Drive.exists(filePath);

    if (isExist) {
      return response.download(`${rootPath}/${filePath}`);
    }
    return 'File does not exist';
  }
}

module.exports = FileController;
