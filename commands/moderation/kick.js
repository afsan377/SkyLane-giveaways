const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kick a user from the server")
  .addUserOption(option =>
    option.setName("user")
          .setDescription("User to kick")
          .setRequired(true))
  .addStringOption(option =>
    option.setName("reason")
          .setDescription("Reason for kick")
          .setRequired(false)),

 async execute(interaction, client) {
  const user = interaction.options.getUser("user");
  const reason = interaction.options.getString("reason") || "No reason provided";

  const member = interaction.guild.members.cache.get(user.id);

  if (!interaction.member.permissions.has("KickMembers"))
   return interaction.reply({ content: "❌ You don't have permission to kick", ephemeral: true });

  if (!interaction.guild.members.me.permissions.has("KickMembers"))
   return interaction.reply({ content: "❌ I can't kick members", ephemeral: true });

  if (!member) return interaction.reply({ content: "❌ Member not found", ephemeral: true });

  await member.kick(reason);

  const embed = new EmbedBuilder()
   .setColor("Orange")
   .setTitle("👢 Member Kicked")
   .addFields(
     { name: "User", value: `${user.tag} (${user.id})`, inline: true },
     { name: "Kicked by", value: `${interaction.user.tag}`, inline: true },
     { name: "Reason", value: reason, inline: false }
   )
   .setTimestamp();

  interaction.reply({ embeds: [embed] });

  const logChannel = await client.channels.fetch("1437309673262022809");
  if (logChannel) logChannel.send({ embeds: [embed] });
 }
};