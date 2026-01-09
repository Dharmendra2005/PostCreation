const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/monGO");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  post: [{
    type:mongoose.Schema.Types.ObjectId,
    ref: "post",
    default: [],
  }]
});

module.exports = mongoose.model("user", userSchema);
