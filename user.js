var mongoose = require('mongoose');

var userSchema = {
  profile: {
    username: { type: String, lowercase: true, required: true },
    picture: { type: String, match: /^http:\/\//i, required: true }
  },
  data: {
    oauth: { type: String, required: true },
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId },
        quantity: { type: Number, default: 1, min: 1 }
      }
    ]
  }
};

module.exports = new mongoose.Schema(userSchema);
