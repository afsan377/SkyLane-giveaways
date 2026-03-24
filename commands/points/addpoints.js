const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { addPoints } = require("../../utils/points");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("addpoints")
  .setDescription("Add points to a user")
  .addUserOption(option =>
   option.setName("user")
    .setDescription("Select a user")
    .setRequired(true)
  )
  .addIntegerOption(option =>
   option.setName("amount")
    .setDescription("Amount of points")
    .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

 async execute(interaction, client) {

  const user = interaction.options.getUser("user");
  const amount = interaction.options.getInteger("amount");

  const newPoints = addPoints(user.id, amount);

  const logChannel = client.channels.cache.get("1430361956367470652");

  if (logChannel) {
   const embed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setDescription(`➕ ${user} received **${amount}** points\nTotal: **${newPoints}**`);

   logChannel.send({ embeds: [embed] });
  }

  await interaction.reply({
   content: `Added **${amount}** points to ${user}.`
  });
 }
};