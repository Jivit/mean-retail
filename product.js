var mongoose = require('mongoose');
var Category = require('./category');

var productSchema = {
  name: { type: String, required: true },
  // Pictures must start with "http://"
  pictures: [{ type: String, match: /^http:\/\//i, require: true }],
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['USD', 'EUR', 'GBP'], required: true }
  },
  category: Category.categorySchema
}

var schema = new mongoose.Schema(productSchema);

var currencySymbols: {
  "USD": "$",
  "EUR": "€",
  "GBP": "£"
}

schema.virtual('displayPrice').get(function(){
  return currencySymbols[this.proce.currency] + '' +
    this.price.amount;
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = schema;
module.exports.productSchema = productSchema;
