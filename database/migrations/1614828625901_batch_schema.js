'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class BatchSchema extends Schema {
  up() {
    this.create('batches', (table) => {
      table.increments('no');
      table.string('name', 254);
      table.integer('work_space_no');
      table.integer('parent');
      table.date('date');
      table.string('user', 254);
      table.timestamps();
    });
  }

  down() {
    this.drop('batches');
  }
}

module.exports = BatchSchema;
