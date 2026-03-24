const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("unlock")
  .setDescription("Unlock the channel"),

 async execute(interaction, client) {
  if (!interaction.member.permissions.has("ManageChannels"))
   return interaction.reply({ content: "❌ You can't manage channels", ephemeral: true });

  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
   SendMessages: true
  });

  const embed = new EmbedBuilder()
   .setColor("Green")
   .setTitle("🔓 Channel Unlocked")
   .addFields(
     { name: "Channel", value: `${interaction.channel.name}`, inline: true },
     { name: "By", value: `${interaction.user.tag}`, inline: true }
   )
   .setTimestamp();

  interaction.reply({ embeds: [embed] });

  const logChannel = await client.channels.fetch("1437309673262022809");
  if (logChannel) logChannel.send({ embeds: [embed] });
 }
};