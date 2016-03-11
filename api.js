var express = require('express');
var status = require('http-status');

module.exports = function(wagner){
  var api = express.Router();

  api.get('/category/id/:id', wagner.invoke(function(Category){
    return function(req, res){
      Category.findOne({ _id: req.params.id },
        handleOne.bind(null, 'category', res));
    };
  }));

  api.get('/category/parent/:id', wagner.invoke(function(Category){
    return function(req, res){
      Category.
        find({ parent: req.params.id }).
        sort({ _id: 1 }).
        exec(handleMany.bind(null, 'categories', res));
    };
  }));

  return api;
};

handleOne = function(property, res, error, doc){
  if(error){
    res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ error: error });
  }
  if(!doc){
    res.
      status(status.NOT_FOUND).
      json({ error: 'Not found'});
  }

  var json = {};
  json[property] = doc;
  res.json(json);
};

handleMany = function(property, res, error, doc){
  if(error){
    res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ error: error });
  }

  var json = {};
  json[property] = doc;
  res.json(json);
};
