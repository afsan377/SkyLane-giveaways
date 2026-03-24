const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("unwarn")
  .setDescription("Remove last warning of a member")
  .addUserOption(option =>
    option.setName("user")
          .setDescription("Member to remove warning")
          .setRequired(true)),

 async execute(interaction, client) {
  const user = interaction.options.getUser("user");
  const warnings = client.warnings.get(user.id) || [];

  if (warnings.length === 0)
   return interaction.reply({ content: "❌ This user has no warnings", ephemeral: true });

  const removed = warnings.pop();
  client.warnings.set(user.id, warnings);

  const embed = new EmbedBuilder()
   .setColor("Green")
   .setTitle("✅ Warning Removed")
   .addFields(
     { name: "User", value: `${user.tag} (${user.id})`, inline: true },
     { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
     { name: "Removed Warning", value: removed, inline: false }
   )
   .setTimestamp();

  interaction.reply({ embeds: [embed] });

  const logChannel = await client.channels.fetch("1437309673262022809");
  if (logChannel) logChannel.send({ embeds: [embed] });
 }
};