const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change someone's nickname")
    .addUserOption(option => option.setName("user").setDescription("Select a user").setRequired(true))
    .addStringOption(option => option.setName("nick").setDescription("New nickname").setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ManageNicknames"))
      return interaction.reply({ content: "❌ You cannot change nicknames.", ephemeral: true });

    const member = interaction.options.getMember("user");
    const nick = interaction.options.getString("nick");

    if (!member) return interaction.reply({ content: "❌ User not found.", ephemeral: true });
    if (!member.manageable) return interaction.reply({ content: "❌ Cannot change this user's nickname.", ephemeral: true });

    await member.setNickname(nick).catch(() => {
      return interaction.reply({ content: "❌ Failed to change nickname.", ephemeral: true });
    });

    return interaction.reply({ content: `✅ Nickname changed for ${member.user.tag}`, ephemeral: true });
  }
};