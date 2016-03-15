var path = require('path');
var fs = require('fs');
var Stripe = require('stripe');
var fx = require('./fx');

module.exports = function(wagner){
  wagner.factory('Stripe', function(Config){
    return Stripe(Config.stripeKey);
  });

  wagner.factory('fx', fx);

  wagner.factory('Config', function(){
    var configFile = path.resolve(__dirname, 'config.json');
    return JSON.parse(fs.readFileSync(configFile).toString());
  });
};
