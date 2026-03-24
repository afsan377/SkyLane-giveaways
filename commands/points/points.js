const { SlashCommandBuilder } = require("discord.js");
const { getPoints } = require("../../utils/points");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("points")
  .setDescription("Check points of a user")
  .addUserOption(option =>
   option.setName("user")
    .setDescription("Select a user")
    .setRequired(false)
  ),

 async execute(interaction) {

  const user = interaction.options.getUser("user") || interaction.user;
  const data = getPoints();

  const points = data[user.id] || 0;

  await interaction.reply({
   content: `${user} has **${points}** points.`
  });
 }
};
