const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Send anonymous message")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Where to send")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("message")
        .setDescription("Message to send")
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName("embed")
        .setDescription("Send as embed?")
        .setRequired(false)),

  async execute(interaction, client) {

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction.reply({ content: "❌ No permission", ephemeral: true });

    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");
    const useEmbed = interaction.options.getBoolean("embed") || false;

    // ✅ SEND MESSAGE
    if (useEmbed) {
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setDescription(message)
        .setFooter({ text: "📢 Anonymous Message" });

      await channel.send({ embeds: [embed] });
    } else {
      await channel.send({ content: message });
    }

    await interaction.reply({
      content: "✅ Message sent anonymously",
      ephemeral: true
    });

    // ✅ LOG WHO SENT (ping)
    try {
      const logChannel = await client.channels.fetch("1437309673262022809");

      const logEmbed = new EmbedBuilder()
        .setColor("Grey")
        .setTitle("📢 Echo Log")
        .addFields(
          { name: "Sender", value: `<@${interaction.user.id}>` },
          { name: "Channel", value: `<#${channel.id}>` },
          { name: "Message", value: message }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    } catch {}
  }
};