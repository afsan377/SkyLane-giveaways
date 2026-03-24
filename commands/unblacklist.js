const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const filePath = "./data/blacklistChannels.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unblacklistchannel")
    .setDescription("Remove a channel from message count blacklist")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Select channel")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    // create file if not exists
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }

    let data = JSON.parse(fs.readFileSync(filePath));

    // check if channel is blacklisted
    if (!data.includes(channel.id)) {
      return interaction.reply({
        content: "❌ This channel is NOT blacklisted.",
        ephemeral: true
      });
    }

    // remove channel
    data = data.filter(id => id !== channel.id);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Channel Unblacklisted")
      .setDescription(`${channel} has been removed from blacklist.`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
