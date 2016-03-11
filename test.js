var assert = require('assert');
var superagent = require('superagent');
var express = require('express');
var wagner = require('wagner-core');

var URL_ROOT = "http://localhost:3000";

describe('Retail API', function(){
  var server;
  var Category;

  before(function(){
    var app = express();

    // Make models available in tests
    var models = require('./models')(wagner);
    Category = models.Category;

    app.use(require('./api')(wagner));

    server = app.listen(3000);
  });

  after(function(){
    // Shut the server down when we're done
    server.close();
  });

  beforeEach(function(done){
    Category.remove({}, function(error){
      assert.ifError(error);
      done();
    });
  });

  beforeEach(function(done){
    var categories = [
      { _id: "Electronics" },
      { _id: "Laptops", parent: "Electronics" },
      { _id: "Cellphones", parent: "Electronics" },
      { _id: "Books" }
    ];

    Category.create(categories, function(error){
      assert.ifError(error);
      done();
    });
  });

  it('can load a category by id', function(done){
    var url = URL_ROOT + "/category/id/Electronics";
    // Make a HTTP request to http://localhsot:300/category/id/Electronics
    superagent.get(url, function(error, res){
      assert.ifError(error);
      // Make sure we got 'Electronics' back
      var result;
      assert.doesNotThrow(function(){
        result = JSON.parse(res.text).category;
      });

      assert.ok(result);
      assert.equal(result._id, "Electronics");
      done();
    });
  });

  it('can load all categories that have a certain parent', function(done){
    var url = URL_ROOT + "/category/parent/Electronics";
    superagent.get(url, function(error, res){
      assert.ifError(error);

      var result;
      assert.doesNotThrow(function(){
        result = JSON.parse(res.text);
      });

      assert.equal(result.categories.length, 2);
      assert.equal(result.categories[0]._id, "Cellphones");
      assert.equal(result.categories[1]._id, "Laptops");
      done();
    });
  });
});
