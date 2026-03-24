const { EmbedBuilder } = require("discord.js");
const { claimedTickets, staffPoints } = require("./supportStore");

module.exports = {
  data: {
    name: "claim",
    description: "Claim the current ticket"
  },

  async execute(interaction) {
    if (!interaction.member.roles.cache.has("1418434416660713593"))
      return interaction.reply({ content: "❌ Only staff can claim tickets.", ephemeral: true });

    if (claimedTickets.has(interaction.channel.id))
      return interaction.reply({ content: "❌ This ticket is already claimed.", ephemeral: true });

    claimedTickets.add(interaction.channel.id);
    staffPoints[interaction.user.id] = (staffPoints[interaction.user.id] || 0) + 1;

    const lastMsg = (await interaction.channel.messages.fetch({ limit: 1 })).first();
    if (lastMsg.embeds.length > 0) {
      const embed = EmbedBuilder.from(lastMsg.embeds[0])
        .setFooter({ text: `✅ Claimed by ${interaction.user.tag}` });
      await lastMsg.edit({ embeds: [embed] });
    }

    interaction.reply({ content: "✅ You claimed this ticket.", ephemeral: true });
  }
};