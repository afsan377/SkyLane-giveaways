const { addMessages } = require("../data/messageCounts");

module.exports = (client) => {
  client.on("messageCreate", (message) => {
      const fs = require("fs");
const path = "./data/blacklistChannels.json";

const blacklist = fs.existsSync(path)
  ? JSON.parse(fs.readFileSync(path))
  : {};

if (blacklist[message.guild.id]?.includes(message.channel.id)) return;
    if (!message.guild || message.author.bot) return;

    addMessages(message.guild.id, message.author.id, 1);
  });
};