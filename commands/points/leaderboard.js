const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPoints } = require("../../utils/points");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("View points leaderboard"),

 async execute(interaction) {

  const data = getPoints();

  const sorted = Object.entries(data)
   .sort((a, b) => b[1] - a[1])
   .slice(0, 10);

  let desc = "";

  sorted.forEach((user, i) => {
   desc += `**${i + 1}.** <@${user[0]}> — ${user[1]} pts\n`;
  });

  if (!desc) desc = "No data.";

  const embed = new EmbedBuilder()
   .setColor("#2b2d31")
   .setTitle("🏆 Leaderboard")
   .setDescription(desc);

  await interaction.reply({ embeds: [embed] });
 }
};