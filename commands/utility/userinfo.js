const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Shows information about a user")
    .addUserOption(option =>
      option.setName("user")
            .setDescription("Select a user")
            .setRequired(false)),

  async execute(interaction, client) {
    const member = interaction.options.getMember("user") || interaction.member;

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("👤 User Info")
      .addFields(
        { name: "User", value: `${member.user.tag}`, inline: true },
        { name: "ID", value: `${member.id}`, inline: true },
        { name: "Joined Server", value: `<t:${Math.floor(member.joinedTimestamp/1000)}:F>`, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:F>`, inline: true }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });

    const logChannel = await client.channels.fetch("1437309673262022809");
    if (logChannel) logChannel.send({ embeds: [embed] });
  }
};