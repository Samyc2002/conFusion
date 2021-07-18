"use strict";

var mongoose = require('mongoose');

require("mongoose-currency").loadType(mongoose);

var Currency = mongoose.Types.Currency;
var Schema = mongoose.Schema;
var dishSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  price: {
    type: Currency,
    required: true,
    min: 0
  },
  featured: {
    type: Boolean,
    "default": true
  }
}, {
  timestamps: true
});
var Dishes = mongoose.model('Dish', dishSchema);
module.exports = Dishes;