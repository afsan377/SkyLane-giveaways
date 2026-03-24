const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("backup-create")
    .setDescription("Create server backup")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {

    await client.createBackup(interaction.guild);

    interaction.reply("💾 Backup created successfully!");
  }
};