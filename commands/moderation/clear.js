const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Delete multiple messages")
  .addIntegerOption(option =>
    option.setName("amount")
          .setDescription("Number of messages to delete")
          .setRequired(true)),

 async execute(interaction, client) {
  const amount = interaction.options.getInteger("amount");

  if (!interaction.member.permissions.has("ManageMessages"))
   return interaction.reply({ content: "❌ You can't manage messages", ephemeral: true });

  if (!interaction.guild.members.me.permissions.has("ManageMessages"))
   return interaction.reply({ content: "❌ I can't delete messages", ephemeral: true });

  const messages = await interaction.channel.messages.fetch({ limit: amount });
  await interaction.channel.bulkDelete(messages, true);

  const embed = new EmbedBuilder()
   .setColor("Blue")
   .setTitle("🧹 Messages Cleared")
   .addFields(
     { name: "Cleared by", value: `${interaction.user.tag}`, inline: true },
     { name: "Channel", value: `${interaction.channel.name}`, inline: true },
     { name: "Amount", value: `${messages.size}`, inline: false }
   )
   .setTimestamp();

  interaction.reply({ embeds: [embed], ephemeral: true });

  const logChannel = await client.channels.fetch("1437309673262022809");
  if (logChannel) logChannel.send({ embeds: [embed] });
 }
};