const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: {
    name: "adduser",
    description: "Add a user to this ticket",
    options: [
      { type: 6, name: "user", description: "User to add", required: true } // USER type
    ]
  },

  async execute(interaction) {
    if (!interaction.member.roles.cache.has("1418434416660713593"))
      return interaction.reply({ content: "❌ Only staff can add users.", ephemeral: true });

    const user = interaction.options.getUser("user");
    await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
    interaction.reply({ content: `✅ Added ${user.tag} to the ticket.`, ephemeral: true });
  },
};