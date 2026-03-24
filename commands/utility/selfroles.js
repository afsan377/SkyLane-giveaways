const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("selfroles")
    .setDescription("Send the self roles embed with dropdown"),
  async execute(interaction, client) {
    await client.sendSelfRoleEmbed(interaction.channel);
    await interaction.reply({ content: "✅ Self roles embed sent!", ephemeral: true });
  }
};