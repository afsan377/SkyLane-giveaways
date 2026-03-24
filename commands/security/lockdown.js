const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Lock the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    interaction.guild.channels.cache.forEach(c => {
      c.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false
      }).catch(() => {});
    });

    interaction.reply("🔒 Server locked down.");
  }
};