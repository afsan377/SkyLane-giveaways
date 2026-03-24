const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("warnings")
  .setDescription("Check warnings of a member")
  .addUserOption(option =>
    option.setName("user")
          .setDescription("Member to check")
          .setRequired(true)),

 async execute(interaction, client) {
  const user = interaction.options.getUser("user");
  const warnings = client.warnings.get(user.id) || [];

  const embed = new EmbedBuilder()
   .setColor("Blue")
   .setTitle(`⚠️ Warnings for ${user.tag}`)
   .setDescription(warnings.length
    ? warnings.map((w, i) => `${i + 1}. ${w}`).join("\n")
    : "No warnings")
   .setTimestamp();

  interaction.reply({ embeds: [embed], ephemeral: true });
 }
};