const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Rename the current ticket channel")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("New ticket channel name")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has("1418434416660713593")) // Staff role
      return interaction.reply({ content: "❌ Only staff can rename tickets.", ephemeral: true });

    const newName = interaction.options.getString("name");
    await interaction.channel.setName(newName);
    interaction.reply({ content: `✅ Ticket renamed to \`${newName}\``, ephemeral: true });
  },
};