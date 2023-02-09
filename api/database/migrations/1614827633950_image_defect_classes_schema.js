'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ImageDefectClassSchema extends Schema {
  up() {
    this.create('image_defect_classes', (table) => {
      table.increments('no');
      table.integer('batch_no');
      table.string('file_name', 254);
      table.integer('defect_classes_no');
      table.timestamps();
    });
  }

  down() {
    this.drop('image_defect_classes');
  }
}

module.exports = ImageDefectClassSchema;
