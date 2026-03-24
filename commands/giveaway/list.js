const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("g-list")
    .setDescription("List all active giveaways"),

  async execute(interaction, client) {
    if (client.giveaways.size === 0) return interaction.reply({ content: "No active giveaways!", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("🎉 Active Giveaways")
      .setColor("Blue")
      .setDescription([...client.giveaways.values()].map(g => `**${g.prize}** — ${g.participants.size} participants`).join("\n"));

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
};