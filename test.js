var assert = require('assert');
var superagent = require('superagent');
var express = require('express');
var wagner = require('wagner-core');
var status = require('http-status');

var URL_ROOT = "http://localhost:3000";
var PRODUCT_ID = '000000000000000000000001';

describe('Retail API', function(){
  var server;
  var Category;
  var Product;
  var User;
  var Stripe;

  before(function(){
    var app = express();

    // Make models available in tests
    var models = require('./models')(wagner);
    var dependencies = require('./dependencies')(wagner);

    Category = models.Category;
    Product = models.Product;
    User = models.User;
    Stripe = dependencies.Stripe;

    app.use(function(req, res, next){
      User.findOne({}, function(error, user){
        assert.ifError(error);
        req.user = user;
        next();
      });
    });

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
        User.remove({}, function(error){
          assert.ifError(error);
          done();
        });
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

    var users = [
      {
        profile: {
          username: 'gdangelo',
          picture: 'http://gdangelo.fr/images/avatar.jpg'
        },
        data: {
          oauth: 'invalid',
          cart: []
        }
      }
    ];

    Category.create(categories, function(error){
      assert.ifError(error);
      Product.create(products, function(error){
        assert.ifError(error);
        User.create(users, function(error){
          assert.ifError(error);
          done();
        });
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

       var url = URL_ROOT + '/product/category/Electronics?price=1';
       superagent.get(url, function(error, res){
         assert.ifError(error);
         var result;
         assert.doesNotThrow(function(){
           result = JSON.parse(res.text);
         });

         assert.equal(result.products.length, 2);
         assert.equal(result.products[0].name, "OnePlus 2");
         assert.equal(result.products[1].name, "Apple MacBook Pro 13''");

       });
     });
   });

   /*
    * USER API
    */
    it('can save users cart', function(done){
      var url = URL_ROOT + "/me/cart";
      superagent.
        put(url).
        send({
          data: {
            cart: [{ product: PRODUCT_ID, quantity: 1 }]
          }
        }).
        end(function(error, res){
          assert.ifError(error);
          assert.equal(res.status, status.OK);
          User.findOne({}, function(error, user){
            assert.ifError(error);
            assert.equal(user.profile.username, 'gdangelo');
            assert.equal(user.data.cart.length, 1);
            assert.equal(user.data.cart[0].product, PRODUCT_ID);
            assert.equal(user.data.cart[0].quantity, 1);
            done();
          });
        });
    });

    it('can load users cart', function(done){
      var url = URL_ROOT + '/me';
      User.findOne({}, function(error, user){
        assert.ifError(error);

        user.data.cart = [{ product: PRODUCT_ID, quantity: 1 }];
        user.save(function(error){
          assert.ifError(error);

          superagent.get(url, function(error, res){
            assert.ifError(error);

            var result;
            assert.doesNotThrow(function(){
              result = JSON.parse(res.text).user;
            });
            assert.equal(result.data.cart.length, 1);
            assert.equal(result.data.cart[0].product._id, PRODUCT_ID);
            assert.equal(result.data.cart[0].product.name, "Apple MacBook Pro 13''");
            done();
          });
        });
      });
    });

    it('can charge a user', function(done){
      var url = URL_ROOT + "/checkout";
      User.findOne({}, function(error, user){
        assert.ifError(error);

        user.data.cart = [{ product: PRODUCT_ID, quantity: 1 }];
        user.save(function(error){
          assert.ifError(error);

          // Attempt to check out
          superagent.
            post(url).
            send({
              // Fake stripe credentials.
              // In production, it should be an encrypted token.
              stripeToken: {
                number: '4242424242424242',
                cvc: '123',
                exp_month: '12',
                exp_year: '2016'
              }
            }).
            end(function(error, res){
              assert.ifError(error);

              assert.equal(res.status, status.OK);

              var result;
              assert.doesNotThrow(function(){
                result = JSON.parse(res.text);
              });

              assert.ok(result.id);

              Stripe.charges.retrieve(result.id, function(error, charge){
                assert.ifError(error);
                assert.ok(charge);
                assert.equal(charge.amount, 1479 * 1.1 * 100); // 1479 EUR
                done();
              });
            });
        });
      });
    });
});
