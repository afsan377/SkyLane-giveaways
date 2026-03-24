const mongoose = require("mongoose");

const schema = new mongoose.Schema({

  userId: String,

  points: {

    type: Number,

    default: 0

  }

});

module.exports = mongoose.model("Points", schema);