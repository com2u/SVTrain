'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class WorkspaceSetting extends Model {
  static get valueColumn() {
    return JSON.parse(this.value);
  }
}

module.exports = WorkspaceSetting;
