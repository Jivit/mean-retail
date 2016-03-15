var mongoose = require('mongoose');
var categorySchema = require('./category');
var userSchema = require('./user');
var _ = require('underscore');

module.exports = function(wagner){
  mongoose.connect('mongodb://localhost:27017/test');

  wagner.factory('db', function(){
    return mongoose;
  });

  var models = {
    Category: mongoose.model('Category', categorySchema, 'categories'),
    User: mongoose.model('User', userSchema, 'users')
  };

  _.each(models, function(value, key){
    wagner.factory(key, function(){
      return value;
    });
  });

  wagner.factory('Product', require('./product'));

  return models;
};
