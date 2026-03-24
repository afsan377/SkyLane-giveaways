const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const path = "./data/blacklistChannels.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Blacklist a channel from message counting")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Select channel")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    const data = fs.existsSync(path)
      ? JSON.parse(fs.readFileSync(path))
      : {};

    if (!data[interaction.guild.id]) data[interaction.guild.id] = [];

    if (data[interaction.guild.id].includes(channel.id)) {
      return interaction.reply({ content: "❌ Channel already blacklisted", ephemeral: true });
    }

    data[interaction.guild.id].push(channel.id);

    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    interaction.reply(`✅ ${channel} is now blacklisted from message counting`);
  }
};