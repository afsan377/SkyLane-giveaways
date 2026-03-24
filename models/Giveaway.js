const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({

  messageId: String,

  channelId: String,

  guildId: String,

  hostId: String,

  prize: String,

  winners: Number,

  requiredRole: String,

  participants: [String],

  endTime: Number,

  ended: {

    type: Boolean,

    default: false

  }

});

module.exports = mongoose.model("Giveaway", giveawaySchema);