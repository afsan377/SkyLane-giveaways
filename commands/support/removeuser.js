module.exports = {
  data: {
    name: "removeuser",
    description: "Remove a user from this ticket",
    options: [
      { type: 6, name: "user", description: "User to remove", required: true } // USER type
    ]
  },

  async execute(interaction) {
    if (!interaction.member.roles.cache.has("1418434416660713593"))
      return interaction.reply({ content: "❌ Only staff can remove users.", ephemeral: true });

    const user = interaction.options.getUser("user");
    await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false });
    interaction.reply({ content: `✅ Removed ${user.tag} from the ticket.`, ephemeral: true });
  },
};