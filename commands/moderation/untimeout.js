const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("untimeout")
  .setDescription("Remove timeout from a member")
  .addUserOption(option =>
    option.setName("user")
          .setDescription("Member to remove timeout")
          .setRequired(true))
  .addStringOption(option =>
    option.setName("reason")
          .setDescription("Reason for removing timeout")
          .setRequired(false)),

 async execute(interaction, client) {
  const user = interaction.options.getUser("user");
  const reason = interaction.options.getString("reason") || "No reason provided";
  const member = interaction.guild.members.cache.get(user.id);

  if (!interaction.member.permissions.has("ModerateMembers"))
   return interaction.reply({ content: "❌ You can't remove timeouts", ephemeral: true });

  if (!interaction.guild.members.me.permissions.has("ModerateMembers"))
   return interaction.reply({ content: "❌ I can't remove timeouts", ephemeral: true });

  if (!member) return interaction.reply({ content: "❌ Member not found", ephemeral: true });

  await member.timeout(null, reason);

  const embed = new EmbedBuilder()
   .setColor("Green")
   .setTitle("⏱️ Timeout Removed")
   .addFields(
     { name: "User", value: `${user.tag} (${user.id})`, inline: true },
     { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
     { name: "Reason", value: reason, inline: false }
   )
   .setTimestamp();

  interaction.reply({ embeds: [embed] });

  const logChannel = await client.channels.fetch("1437309673262022809");
  if (logChannel) logChannel.send({ embeds: [embed] });
 }
};