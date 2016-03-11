var assert = require('assert');
var superagent = require('superagent');
var express = require('express');
var wagner = require('wagner-core');

var URL_ROOT = "http://localhost:3000";
var PRODUCT_ID = '000000000000000000000001';

describe('Retail API', function(){
  var server;
  var Category;
  var Product;

  before(function(){
    var app = express();

    // Make models available in tests
    var models = require('./models')(wagner);
    Category = models.Category;
    Product = models.Product;

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
      Product.remove({}, function(error){
        assert.ifError(error);
        done();
      });
    });
  });

  beforeEach(function(done){
    var categories = [
      { _id: "Electronics" },
      { _id: "Laptops", parent: "Electronics" },
      { _id: "Cellphones", parent: "Electronics" },
      { _id: "Books" }
    ];

    var products = [
      {
        _id: PRODUCT_ID,
        name: "Apple MacBook Pro 13''",
        price: {
          amount: 1479.00,
          currency: "EUR"
        },
        category: { _id: 'Laptops', ancestors: ['Electronics', 'Laptops'] }
      },
      {
        name: "OnePlus 2",
        price: {
          amount: 440.79,
          currency: "EUR"
        },
        category: { _id: 'Cellphones', ancestors: ['Electronics', 'Cellphones'] }
      },
      {
        name: "Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future",
        price: {
          amount: 19.08,
          currency: "EUR"
        },
        category: { _id: 'Books' }
      }
    ];

    Category.create(categories, function(error){
      assert.ifError(error);
      Product.create(products, function(error){
        assert.ifError(error);
        done();
      });
    });
  });

  /*
   * CATEGORY API
   */
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

  /*
   * PRODUCT API
   */
   it('can load a product by id', function(done){
     var url = URL_ROOT + '/product/id/' + PRODUCT_ID;
     // Make an HTTP request to
     // "localhost:3000/product/id/000000000000000000000001"
     superagent.get(url, function(error, res) {
       assert.ifError(error);
       var result;
       // And make sure we got the MacBook back
       assert.doesNotThrow(function() {
         result = JSON.parse(res.text).product;
       });
       assert.ok(result);
       assert.equal(result._id, PRODUCT_ID);
       assert.equal(result.name, "Apple MacBook Pro 13''");
       done();
     });
   });

   it('can load all products in category with sub-categories', function(done){
     var url = URL_ROOT + '/product/category/Electronics';
     superagent.get(url, function(error, res){
       assert.ifError(error);
       var result;
       assert.doesNotThrow(function(){
         result = JSON.parse(res.text);
       });
       assert.equal(result.products.length, 2);
       assert.equal(result.products[0].name, "Apple MacBook Pro 13''");
       assert.equal(result.products[1].name, "OnePlus 2");

       url = URL_ROOT + '/product/category/Electronics?price=1';
       superagent.get(url, function(error, res){
         assert.ifError(error);
         var result;
         assert.doesNotThrow(function(){
           result = JSON.parse(res.text);
         });
         assert.equal(result.products.length, 2);
         assert.equal(result.products[0].name, "OnePlus 2");
         assert.equal(result.products[1].name, "Apple MacBook Pro 13''");
         done();
       });
     });
   });
});
