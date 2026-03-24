const { EmbedBuilder } = require("discord.js");

const LOG_CHANNEL = "1437309673262022809";

module.exports = (client) => {

 // DELETE LOG
 client.on("messageDelete", async (message) => {
  if (!message.guild || message.author?.bot) return;

  const logChannel = message.guild.channels.cache.get(LOG_CHANNEL);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
   .setColor("Red")
   .setTitle("🗑 Message Deleted")
   .setDescription(
`**User:** ${message.author}
**Channel:** ${message.channel}
**Content:** ${message.content || "None"}`
   )
   .setTimestamp();

  logChannel.send({ embeds: [embed] });
 });

 // EDIT LOG
 client.on("messageUpdate", async (oldMsg, newMsg) => {
  if (!oldMsg.guild || oldMsg.author?.bot) return;
  if (oldMsg.content === newMsg.content) return;

  const logChannel = oldMsg.guild.channels.cache.get(LOG_CHANNEL);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
   .setColor("Yellow")
   .setTitle("✏ Message Edited")
   .setDescription(
`**User:** ${oldMsg.author}
**Channel:** ${oldMsg.channel}

**Before:** ${oldMsg.content || "None"}
**After:** ${newMsg.content || "None"}`
   )
   .setTimestamp();

  logChannel.send({ embeds: [embed] });
 });

};