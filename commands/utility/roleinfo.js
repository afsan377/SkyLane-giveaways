const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Shows detailed information about a role")
    .addRoleOption(option =>
      option.setName("role")
            .setDescription("Select a role")
            .setRequired(true)),

  async execute(interaction, client) {
    const role = interaction.options.getRole("role");

    const embed = new EmbedBuilder()
      .setColor(role.color || "Grey")
      .setTitle(`🔹 Role Info - ${role.name}`)
      .addFields(
        { name: "Role ID", value: `${role.id}`, inline: true },
        { name: "Color", value: `${role.hexColor}`, inline: true },
        { name: "Members", value: `${role.members.size}`, inline: true },
        { name: "Mentionable", value: `${role.mentionable}`, inline: true },
        { name: "Hoisted", value: `${role.hoist}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });

    const logChannel = await client.channels.fetch("1437309673262022809");
    if (logChannel) logChannel.send({ embeds: [embed] });
  }
};