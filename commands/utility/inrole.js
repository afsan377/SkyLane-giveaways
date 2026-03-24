const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inrole")
    .setDescription("Shows all members with a role")
    .addRoleOption(option =>
      option.setName("role")
            .setDescription("Select a role")
            .setRequired(true)),

  async execute(interaction, client) {
    const role = interaction.options.getRole("role");

    const members = role.members.map(m => m.user.tag);
    const memberList = members.length > 0 ? members.join("\n") : "No members";

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle(`📋 Members in Role - ${role.name}`)
      .setDescription(memberList)
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });

    const logChannel = await client.channels.fetch("1437309673262022809");
    if (logChannel) logChannel.send({ embeds: [embed] });
  }
};