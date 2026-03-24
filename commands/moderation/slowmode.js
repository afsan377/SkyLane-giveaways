const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode in a channel")
    .addIntegerOption(option =>
      option.setName("seconds")
            .setDescription("Slowmode duration in seconds")
            .setRequired(true)),

  async execute(interaction, client) {
    const seconds = interaction.options.getInteger("seconds");

    if (!interaction.member.permissions.has("ManageChannels"))
      return interaction.reply({ content: "❌ You can't manage channels", ephemeral: true });

    await interaction.channel.setRateLimitPerUser(seconds);

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("⏱️ Slowmode Updated")
      .addFields(
        { name: "Channel", value: `${interaction.channel.name}`, inline: true },
        { name: "Duration", value: `${seconds} seconds`, inline: true },
        { name: "By", value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });

    const logChannel = await client.channels.fetch("1437309673262022809");
    if (logChannel) logChannel.send({ embeds: [embed] });
  }
};