const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reroll")
    .setDescription("Reroll a giveaway")
    .addStringOption(option =>
      option.setName("id")
        .setDescription("Message ID of the giveaway")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const messageId = interaction.options.getString("id");
    const giveaway = client.giveaways.get(messageId) || client.endedGiveaways.get(messageId);

    if (!giveaway) return interaction.reply({ content: "❌ Giveaway not found.", ephemeral: true });

    const participants = Array.from(giveaway.participants);
    if (!participants.length) return interaction.reply({ content: "⚠️ No participants to pick from.", ephemeral: true });

    const winnerId = participants[Math.floor(Math.random() * participants.length)];

// ✅ SAVE NEW WINNER
giveaway.winners = [winnerId];
giveaway.endedAt = Date.now();
    const winner = await interaction.guild.members.fetch(winnerId).catch(() => null);

    if (!winner) return interaction.reply({ content: "⚠️ Could not fetch winner.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("🎉 Giveaway Rerolled!")
      .setDescription(`New Winner: <@${winner.id}>`)
      .setColor("Green");

    const channel = await client.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(messageId);
    await message.reply({ embeds: [embed] });

    return interaction.reply({ content: `✅ Winner rerolled: <@${winner.id}>`, ephemeral: true });
  }
};