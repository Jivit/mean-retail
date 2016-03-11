var mongoose = require('mongoose');
var categorySchema = require('./category');
var productSchema = require('./product');

module.exports = function(){
  mongoose.connect('mongodb://localhost:27017/test');

  var models = {
    Category: mongoose.model('Category', categorySchema, 'categories'),
    Product: mongoose.model('Product', productSchema, 'products')
  };

  return models;
}
