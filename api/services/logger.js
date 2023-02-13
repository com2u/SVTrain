const log4js = require('log4js')
log4js.configure({
  appenders: { activity: { type: 'file', filename: 'SVTrain.log' } },
  categories: { default: { appenders: ['activity'], level: 'info' } }

});

const logger = log4js.getLogger('activity')
module.exports = logger

