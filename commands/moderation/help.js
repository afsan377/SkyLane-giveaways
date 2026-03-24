const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all bot commands"),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Bot Commands")
      .setColor("Blue")
      .setDescription(
        client.commands.map(c => `**/${c.data.name}** — ${c.data.description || "No description"}`).join("\n")
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};