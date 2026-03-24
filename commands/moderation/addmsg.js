const { SlashCommandBuilder } = require("discord.js");
const { addMessages } = require("../../data/messageCounts");

const STAFF_ID = "768760388459692043";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addmsg")
    .setDescription("Add message count to a user")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Select a user to add messages to")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount of messages to add")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== STAFF_ID)
      return interaction.reply({ content: "❌ You cannot use this command.", ephemeral: true });

    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    addMessages(interaction.guild.id, user.id, amount);

    await interaction.reply({ content: `✅ Added ${amount} messages to ${user.tag}`, ephemeral: true });
  },
};