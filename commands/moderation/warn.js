const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Warn a member")
  .addUserOption(option =>
    option.setName("user")
          .setDescription("User to warn")
          .setRequired(true))
  .addStringOption(option =>
    option.setName("reason")
          .setDescription("Reason for warning")
          .setRequired(false)),

 async execute(interaction, client) {
  const user = interaction.options.getUser("user");
  const reason = interaction.options.getString("reason") || "No reason provided";
  const member = interaction.guild.members.cache.get(user.id);

  // ✅ STAFF PERMISSION (better way)
  if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
   return interaction.reply({ content: "❌ You can't warn members", ephemeral: true });

  if (!member) return interaction.reply({ content: "❌ Member not found", ephemeral: true });

  // ✅ ROLE HIERARCHY CHECK
  if (interaction.member.roles.highest.position <= member.roles.highest.position) {
    return interaction.reply({
      content: "😏 Bro really tried to warn someone above him... not happening.",
      ephemeral: true
    });
  }

  // ✅ BOT ROLE CHECK (extra safety)
  if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) {
    return interaction.reply({
      content: "💀 Even I can't touch this user. They are too powerful.",
      ephemeral: true
    });
  }

  if (!client.warnings.has(user.id)) client.warnings.set(user.id, []);
  const warnings = client.warnings.get(user.id);
  warnings.push(reason);

  // AUTO-TIMEOUT IF 3 WARNINGS
  let autoTimeoutEmbed;
  if (warnings.length >= 3) {
   await member.timeout(2 * 60 * 60 * 1000, "Reached 3 warnings"); // 2 hours
   client.warnings.set(user.id, []); // reset warnings

   autoTimeoutEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("⏱️ Auto Timeout (3 Warnings)")
    .addFields(
      { name: "User", value: `${user.tag} (${user.id})`, inline: true },
      { name: "Moderator", value: `System`, inline: true },
      { name: "Duration", value: "2 hours", inline: false },
      { name: "Reason", value: "Reached 3 warnings", inline: false }
    )
    .setTimestamp();
  }

  const embed = new EmbedBuilder()
   .setColor("Yellow")
   .setTitle("⚠️ Member Warned")
   .addFields(
     { name: "User", value: `${user.tag} (${user.id})`, inline: true },
     { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
     { name: "Reason", value: reason, inline: false },
     { name: "Total Warnings", value: `${warnings.length}`, inline: false }
   )
   .setTimestamp();

  interaction.reply({ embeds: [embed] });

  const logChannel = await client.channels.fetch("1437309673262022809");
  if (logChannel) {
   logChannel.send({ embeds: [embed] });
   if (autoTimeoutEmbed) logChannel.send({ embeds: [autoTimeoutEmbed] });
  }
 }
};