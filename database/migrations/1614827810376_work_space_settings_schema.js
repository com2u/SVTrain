'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WorkSpaceSettingsSchema extends Schema {
  up () {
    this.create('workspace_settings', (table) => {
      table.integer('work_space_no');
      table.string('name', 254);
      table.string('value', 254);
      table.timestamps()
    })
  }

  down () {
    this.drop('workspace_settings')
  }
}

module.exports = WorkSpaceSettingsSchema
