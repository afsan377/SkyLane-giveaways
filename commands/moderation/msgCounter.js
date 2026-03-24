const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("msg-counter")
    .setDescription("Show message leaderboard"),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const data = client.msgCounts || {}; // { userId: count }

    const sorted = Object.entries(data).sort(([,a],[,b]) => b-a).slice(0, 10);
    if (sorted.length === 0) return interaction.reply({ content: "No messages counted yet.", ephemeral: true });

    const description = sorted.map(([id, count], i) => `${i+1}. <@${id}> — **${count} messages**`).join("\n");

    interaction.reply({ embeds: [new EmbedBuilder().setTitle("📝 Message Leaderboard").setDescription(description).setColor("Blue")] });
  }
};