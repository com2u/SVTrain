'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class DefectClassesSchema extends Schema {
  up() {
    this.create('defect_classes', (table) => {
      table.increments('no');
      table.string('name', 80).notNullable().unique();
      table.string('icon', 254);
      table.timestamps();
    });
  }

  down() {
    this.drop('defect_classes');
  }
}

module.exports = DefectClassesSchema;
