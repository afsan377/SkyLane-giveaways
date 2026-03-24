const { claimedTickets } = require("./supportStore");

module.exports = {
  data: {
    name: "unclaim",
    description: "Unclaim the current ticket"
  },

  async execute(interaction) {
    if (!interaction.member.roles.cache.has("1418434416660713593"))
      return interaction.reply({ content: "❌ Only staff can unclaim tickets.", ephemeral: true });

    if (!claimedTickets.has(interaction.channel.id))
      return interaction.reply({ content: "❌ This ticket is not claimed.", ephemeral: true });

    claimedTickets.delete(interaction.channel.id);
    interaction.reply({ content: "✅ Ticket unclaimed.", ephemeral: true });
  }
};