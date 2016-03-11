var mongoose = require('mongoose');
var categorySchema = require('./category');
var productSchema = require('./product');
var _ = require('underscore');

module.exports = function(wagner){
  mongoose.connect('mongodb://localhost:27017/test');

  var models = {
    Category: mongoose.model('Category', categorySchema, 'categories'),
    Product: mongoose.model('Product', productSchema, 'products')
  };

  _.each(models, function(value, key){
    wagner.factory(key, function(){
      return value;
    });
  });

  return models;
}
