const {
 SlashCommandBuilder,
 EmbedBuilder,
 ButtonBuilder,
 ActionRowBuilder,
 ButtonStyle
} = require("discord.js");

const endGiveaway = require("../../utils/giveawayEnd");

const bullet = "<a:lol:1468631266676183094>";
const cornerEmoji = "https://cdn.discordapp.com/emojis/1481335457764610080.gif";

function parseDuration(duration) {
 const time = parseInt(duration.slice(0, -1));
 const unit = duration.slice(-1);

 if (unit === "m") return time * 60000;
 if (unit === "h") return time * 3600000;
 if (unit === "d") return time * 86400000;

 return null;
}

module.exports = {

 data: new SlashCommandBuilder()
  .setName("giveaway")
  .setDescription("Start a giveaway")

  .addStringOption(option =>
   option.setName("prize")
    .setDescription("Giveaway prize")
    .setRequired(true))

  .addIntegerOption(option =>
   option.setName("winners")
    .setDescription("Number of winners")
    .setRequired(true))

  .addStringOption(option =>
   option.setName("duration")
    .setDescription("Example: 10m / 1h / 1d")
    .setRequired(true))

  .addRoleOption(option =>
   option.setName("required_role")
    .setDescription("Role required to join")
    .setRequired(false)),

 async execute(interaction, client) {

  const prize = interaction.options.getString("prize");
  const winners = interaction.options.getInteger("winners");
  const duration = interaction.options.getString("duration");
  const requiredRole = interaction.options.getRole("required_role");

  const durationMs = parseDuration(duration);

  if (!durationMs) {
   return interaction.reply({
    content: "Invalid duration",
    ephemeral: true
   });
  }

  const start = Math.floor(Date.now() / 1000);
  const end = Math.floor((Date.now() + durationMs) / 1000);

  const embed = new EmbedBuilder()
   .setColor("#2b2d31")
   .setTitle(`🎁 ${prize} 🎁`)
   .setThumbnail(cornerEmoji)
   .setDescription(
`${bullet} Winners: **${winners}**
${bullet} Participants: **0**
${bullet} Started at: <t:${start}:F>
${bullet} Ends: <t:${end}:R> (<t:${end}:F>)
${bullet} Duration: **${duration}**
${bullet} Hosted by: ${interaction.user}
${bullet} Prize: **${prize}**

Click the button below to participate!`
   );

  /* BUTTON */

  const joinButton = new ButtonBuilder()
   .setCustomId("join_tmp")
   .setLabel("Join Giveaway")
   .setEmoji("<a:tadaa:1482402836519190610>")
   .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(joinButton);

  const msg = await interaction.reply({
   embeds: [embed],
   components: [row],
   fetchReply: true
  });

  // Update button with message ID
  joinButton.setCustomId(`join_${msg.id}`);
  const updatedRow = new ActionRowBuilder().addComponents(joinButton);
  await msg.edit({ components: [updatedRow] });

  client.giveaways.set(msg.id, {
   participants: new Set(),
   winners,
   prize,
   host: interaction.user,
   start,
   end,
   duration,
   channelId: msg.channel.id,
   messageId: msg.id,
   requiredRole: requiredRole ? requiredRole.id : null
  });

  /* ================= GIVEAWAY START LOG ================= */

  const logChannel = client.channels.cache.get("1437309513848848414");

  if (logChannel) {
   const logEmbed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🎉 Giveaway Started")
    .setDescription(
`${bullet} Prize: **${prize}**
${bullet} Host: ${interaction.user}
${bullet} Winners: **${winners}**
${bullet} Duration: **${duration}**
${bullet} Channel: ${interaction.channel}`
    )
    .setTimestamp();

   logChannel.send({ embeds: [logEmbed] });
  }

  /* AUTO END */

  setTimeout(() => {
   endGiveaway(client, client.giveaways.get(msg.id));
  }, durationMs);
 }
};