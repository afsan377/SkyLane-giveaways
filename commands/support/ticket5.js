const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const fs = require("fs");

module.exports = (client) => {

  const LOG_CHANNEL = "1459946364396900599";

  const VERIFIED_ROLE = "1459950493941108756";

  const RANK_ROLES = {
    vip: "1458865743075610644",
    "vip+": "1458866044134490256",
    mvp: "1458866123419156503",
    "mvp+": "1460264744660373535"
  };

  const STAFF_POINTS_FILE = "./data/verify_points.json";

  const QUESTIONS = [
    "Your IGN?",
    "Your rank in game?",
    "Are you linked to Fakepixel?"
  ];

  const active = new Map();

  function loadPoints() {
    if (!fs.existsSync(STAFF_POINTS_FILE)) return {};
    return JSON.parse(fs.readFileSync(STAFF_POINTS_FILE));
  }

  function savePoints(data) {
    fs.writeFileSync(STAFF_POINTS_FILE, JSON.stringify(data, null, 2));
  }

  // ================= INTERACTION =================
  client.on("interactionCreate", async (interaction) => {
    try {

      // ===== START =====
      if (interaction.isButton() && interaction.customId === "start_verification") {

        if (active.has(interaction.user.id)) {
          return interaction.reply({ content: "❌ Already verifying.", ephemeral: true });
        }

        const age = Date.now() - interaction.user.createdTimestamp;
        if (age < 3 * 24 * 60 * 60 * 1000) {
          return interaction.reply({ content: "❌ Account too new.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const channel = await interaction.guild.channels.create({
          name: `verify-${interaction.user.username}`.slice(0, 20),
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
          ]
        });

        active.set(interaction.user.id, {
          step: 0,
          answers: [],
          channelId: channel.id,
          screenshot: null,
          timeout: setTimeout(() => {
            channel.delete().catch(() => {});
            active.delete(interaction.user.id);
          }, 10 * 60 * 1000)
        });

        await interaction.editReply(`✅ Verification started: ${channel}`);

        const embed = new EmbedBuilder()
          .setColor("#2B2D31")
          .setTitle("🔐 Verification")
          .setDescription(`**Q1:** ${QUESTIONS[0]}`);

        return channel.send({ content: `${interaction.user}`, embeds: [embed] });
      }

      // ===== ACCEPT / DECLINE =====
      if (interaction.isButton() && interaction.customId.startsWith("verify_")) {

        const [_, action, userId] = interaction.customId.split("_");

        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) return;

        const data = active.get(userId);

        await interaction.deferUpdate();

        if (action === "accept") {

          // ===== VERIFIED ROLE =====
          if (VERIFIED_ROLE) {
            await member.roles.add(VERIFIED_ROLE).catch(() => {});
          }

          // ===== SMART RANK =====
          let rank = (data?.answers?.[1] || "").toLowerCase().replace(/\s+/g, "");
          if (rank.includes("vip+")) rank = "vip+";
          else if (rank.includes("mvp+")) rank = "mvp+";
          else if (rank.includes("mvp")) rank = "mvp";
          else if (rank.includes("vip")) rank = "vip";

          if (RANK_ROLES[rank]) {
            await member.roles.add(RANK_ROLES[rank]).catch(() => {});
          }

          // ===== AUTO NICKNAME =====
          const ign = data?.answers?.[0];
          if (ign) {
            await member.setNickname(ign).catch(() => {});
          }

          // ===== STAFF POINTS =====
          const points = loadPoints();
          if (!points[interaction.user.id]) points[interaction.user.id] = 0;
          points[interaction.user.id] += 1;
          savePoints(points);

          await member.send("✅ You are verified now!");

          await interaction.message.edit({
            content: `✅ Accepted by ${interaction.user}`,
            components: []
          });
        }

        if (action === "decline") {

          await member.send("❌ You got declined.");

          await interaction.message.edit({
            content: `❌ Declined by ${interaction.user}`,
            components: []
          });
        }
      }

    } catch (err) {
      console.log("verify error:", err);
    }
  });

  // ================= MESSAGE =================
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      const data = active.get(message.author.id);
      if (!data) return;

      if (message.channel.id !== data.channelId) return;

      // ===== QUESTIONS =====
      if (data.step < QUESTIONS.length) {

        data.answers.push(message.content);
        data.step++;

        if (data.step < QUESTIONS.length) {
          const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("🔐 Verification")
            .setDescription(`**Q${data.step + 1}:** ${QUESTIONS[data.step]}`);

          return message.channel.send({ embeds: [embed] });
        }

        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#2B2D31")
              .setTitle("📸 Screenshot Required")
              .setDescription("Send your **rank screenshot** now.")
          ]
        });
      }

      // ===== SCREENSHOT =====
      if (!data.screenshot) {

        if (message.attachments.size === 0) {
          return message.reply("❌ Send an image.");
        }

        const attachment = message.attachments.first();

        // Use .url to make it clickable in embed
        const img = attachment.url;

        data.screenshot = img;

        clearTimeout(data.timeout);

        const logChannel = client.channels.cache.get(LOG_CHANNEL);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
          .setColor("#2B2D31")
          .setTitle("🔐 New Verification Request")
          .setDescription(`User: ${message.author}`)
          .addFields(
            { name: "IGN", value: data.answers[0] },
            { name: "Rank", value: data.answers[1] },
            { name: "Linked", value: data.answers[2] }
          )
          .setImage(img) // ✅ FIXED
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`verify_accept_${message.author.id}`)
            .setLabel("Accept")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`verify_decline_${message.author.id}`)
            .setLabel("Decline")
            .setStyle(ButtonStyle.Danger)
        );

        await logChannel.send({
          content: `${message.author}`,
          embeds: [embed],
          components: [row]
        });

        // DELETE CHANNEL AFTER LOG SUBMIT
        setTimeout(() => {
          message.channel.delete().catch(() => {});
        }, 3000);

        active.delete(message.author.id);
      }

    } catch (err) {
      console.log("verify msg error:", err);
    }
  });
};