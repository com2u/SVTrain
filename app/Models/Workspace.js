'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Workspace extends Model {
  batches() {
    return this.hasMany('App/Models/Batch', 'no', 'work_space_no');
  }

  settings() {
    return this.hasOne('App/Models/WorkspaceSetting', 'no', 'work_space_no');
  }
}

module.exports = Workspace;
