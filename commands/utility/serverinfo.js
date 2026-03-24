const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays information about this server"),

  async execute(interaction, client) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`🏰 Server Info - ${guild.name}`)
      .addFields(
        { name: "Server ID", value: `${guild.id}`, inline: true },
        { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
        { name: "Members", value: `${guild.memberCount}`, inline: true },
        { name: "Roles", value: `${guild.roles.cache.size}`, inline: true },
        { name: "Channels", value: `${guild.channels.cache.size}`, inline: true },
        { name: "Boost Level", value: `Tier ${guild.premiumTier}`, inline: true }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });

    const logChannel = await client.channels.fetch("1437309673262022809");
    if (logChannel) logChannel.send({ embeds: [embed] });
  }
};