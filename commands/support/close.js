module.exports = {
  data: {
    name: "close",
    description: "Close this ticket channel"
  },

  async execute(interaction) {
    if (!interaction.member.roles.cache.has("1418434416660713593"))
      return interaction.reply({ content: "❌ Only staff can close tickets.", ephemeral: true });

    await interaction.reply({ content: "❌ Ticket closed.", ephemeral: true });
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  },
};