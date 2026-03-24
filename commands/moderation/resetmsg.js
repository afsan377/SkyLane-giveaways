const { SlashCommandBuilder } = require("discord.js");
const { resetMessages } = require("../../data/messageCounts");

const STAFF_ID = "768760388459692043";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetmsg")
    .setDescription("Reset a member's message count or all")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Select a user to reset")
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName("all")
        .setDescription("Reset all users")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (interaction.user.id !== STAFF_ID)
      return interaction.reply({ content: "❌ You cannot use this command.", ephemeral: true });

    const user = interaction.options.getUser("user");
    const all = interaction.options.getBoolean("all");

    if (all) {
      resetMessages(interaction.guild.id, "all");
      return interaction.reply({ content: "✅ All message counts reset.", ephemeral: true });
    }

    if (!user) return interaction.reply({ content: "❌ Please select a user or use 'all'.", ephemeral: true });

    resetMessages(interaction.guild.id, user.id);
    return interaction.reply({ content: `✅ Message count reset for ${user.tag}`, ephemeral: true });
  },
};