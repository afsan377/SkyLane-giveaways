const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    interaction.guild.channels.cache.forEach(c => {
      c.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: null
      }).catch(() => {});
    });

    interaction.reply("🔓 Server unlocked.");
  }
};