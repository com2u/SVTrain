'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DefectClass extends Model {
  image_defect_classes() {
    return this.hasMany('App/Models/ImageDefectClass', 'no', 'defect_classes_no');
  }
}

module.exports = DefectClass
