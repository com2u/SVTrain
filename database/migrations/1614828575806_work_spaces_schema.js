'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WorkSpacesSchema extends Schema {
  up () {
    this.create('workspaces', (table) => {
      table.increments('no')
      table.string('name', 254);
      table.string('notes', 254);
      table.boolean('highlight');
      table.text('settings')
      table.timestamps()
    })
  }

  down () {
    this.drop('workspaces')
  }
}

module.exports = WorkSpacesSchema
