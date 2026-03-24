const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("lock")
  .setDescription("Lock the channel"),

 async execute(interaction, client) {
  if (!interaction.member.permissions.has("ManageChannels"))
   return interaction.reply({ content: "❌ You can't manage channels", ephemeral: true });

  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
   SendMessages: false
  });

  const embed = new EmbedBuilder()
   .setColor("Red")
   .setTitle("🔒 Channel Locked")
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