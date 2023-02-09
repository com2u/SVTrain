'use strict';

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

module.exports = {
    default: 'local',

    disks: {
        local: {
            root: Env.get('ROOT_PATH'),
            driver: 'local',
        }
    },
};