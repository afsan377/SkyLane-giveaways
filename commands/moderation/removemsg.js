const { SlashCommandBuilder } = require("discord.js");
const { removeMessages } = require("../../data/messageCounts");

const STAFF_ID = "768760388459692043";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removemsg")
    .setDescription("Remove message count from a user")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Select a user to remove messages from")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount of messages to remove")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== STAFF_ID)
      return interaction.reply({ content: "❌ You cannot use this command.", ephemeral: true });

    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    removeMessages(interaction.guild.id, user.id, amount);

    await interaction.reply({ content: `✅ Removed ${amount} messages from ${user.tag}`, ephemeral: true });
  },
};