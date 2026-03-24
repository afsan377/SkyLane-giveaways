const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("timeout")
  .setDescription("Timeout a member")
  .addUserOption(option =>
    option.setName("user")
      .setDescription("Member to timeout")
      .setRequired(true))
  .addStringOption(option =>
    option.setName("duration")
      .setDescription("Duration (10m, 2h, 1d)")
      .setRequired(true))
  .addStringOption(option =>
    option.setName("reason")
      .setDescription("Reason for timeout")
      .setRequired(false)),

 async execute(interaction, client) {

  const user = interaction.options.getUser("user");
  const durationInput = interaction.options.getString("duration");
  const reason = interaction.options.getString("reason") || "No reason provided";

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  // ✅ PERMISSIONS
  if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
    return interaction.reply({ content: "❌ You can't timeout members", ephemeral: true });

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers))
    return interaction.reply({ content: "❌ I can't timeout members", ephemeral: true });

  if (!member)
    return interaction.reply({ content: "❌ Member not found", ephemeral: true });

  if (member.permissions.has(PermissionFlagsBits.Administrator))
    return interaction.reply({ content: "❌ Cannot timeout this user", ephemeral: true });

  // ✅ TIME PARSE
  const match = durationInput.match(/^(\d+)(m|h|d)$/);
  if (!match)
    return interaction.reply({
      content: "❌ Use format: 10m, 2h, 1d",
      ephemeral: true
    });

  const value = parseInt(match[1]);
  const unit = match[2];

  let duration;
  if (unit === "m") duration = value * 60 * 1000;
  if (unit === "h") duration = value * 60 * 60 * 1000;
  if (unit === "d") duration = value * 24 * 60 * 60 * 1000;

  // ✅ MAX LIMIT (28 DAYS)
  if (duration > 28 * 24 * 60 * 60 * 1000)
    return interaction.reply({
      content: "❌ Max timeout is 28 days",
      ephemeral: true
    });

  // ✅ APPLY TIMEOUT
  await member.timeout(duration, reason);

  // ✅ DM USER
  const dmEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("⏱️ You have been timed out")
    .addFields(
      { name: "Server", value: interaction.guild.name },
      { name: "Duration", value: durationInput },
      { name: "Reason", value: reason }
    )
    .setTimestamp();

  try {
    await user.send({ embeds: [dmEmbed] });
  } catch {
    // user has DMs off, ignore
  }

  // ✅ PUBLIC EMBED
  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle("⏱️ Member Timed Out")
    .addFields(
      { name: "👤 User", value: `${user.tag} (${user.id})`, inline: true },
      { name: "🛡️ Moderator", value: `${interaction.user.tag}`, inline: true },
      { name: "⏳ Duration", value: durationInput, inline: false },
      { name: "📄 Reason", value: reason, inline: false }
    )
    .setThumbnail(user.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  // ✅ FANCY MOD LOG
  try {
    const logChannel = await client.channels.fetch("1437309673262022809");

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🛑 Timeout Log")
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})` },
          { name: "Moderator", value: `${interaction.user.tag}` },
          { name: "Duration", value: durationInput },
          { name: "Reason", value: reason }
        )
        .setFooter({ text: `User ID: ${user.id}` })
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    }
  } catch {}

 }
};