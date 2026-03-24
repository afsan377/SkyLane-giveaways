// events/interactionCreate.js
const fs = require("fs");
const path = require("path");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

const giveawaysPath = path.join(__dirname, "../data/giveaways.json");
const pointsPath = path.join(__dirname, "../data/points.json");

const cooldowns = new Map();

module.exports = async (interaction, client) => {

  // 🎉 CLAIM BUTTON
  if (interaction.customId === "claim") {
    const data = JSON.parse(fs.readFileSync(giveawaysPath));

    const wins = Object.entries(data).filter(([id, g]) =>
      g.winner === interaction.user.id &&
      !g.claimed &&
      Date.now() - g.endedAt < 86400000
    );

    if (!wins.length) {
      return interaction.reply({ content: "❌ No giveaways to claim", ephemeral: true });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("claim_select")
      .setPlaceholder("Select giveaway");

    wins.forEach(([id, g]) => {
      menu.addOptions({
        label: `${g.host} ${g.prize}`,
        description: `ID: ${id}`,
        value: id
      });
    });

    const row = new ActionRowBuilder().addComponents(menu);

    interaction.reply({ components: [row], ephemeral: true });
  }

  // 🔽 SELECT MENU
  if (interaction.customId === "claim_select") {
    const id = interaction.values[0];
    const data = JSON.parse(fs.readFileSync(giveawaysPath));
    const g = data[id];

    const channel = await interaction.guild.channels.create({
      name: `claim-${g.host}-${g.prize}`,
      type: 0,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: STAFF_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setThumbnail("YOUR_LOGO_URL")
      .setDescription(`
Hello ${interaction.user}

📌 Ticket Info
• Type: Giveaway Claim  
• ID: ${id}

🎉 Details
• Host: ${g.host}  
• Prize: ${g.prize}
`);

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`confirm_${id}`).setLabel("✅ Confirm").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("call").setLabel("📢 Call Staff").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("close").setLabel("🔒 Close").setStyle(ButtonStyle.Danger)
    );

    channel.send({ content: `<@&${STAFF_ROLE}>`, embeds: [embed], components: [buttons] });

    interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
  }

  // ✅ CONFIRM CLAIM (STAFF ONLY)
  if (interaction.customId.startsWith("confirm_")) {
    if (!interaction.member.roles.cache.has(STAFF_ROLE))
      return interaction.reply({ content: "❌ Staff only", ephemeral: true });

    const id = interaction.customId.split("_")[1];
    const data = JSON.parse(fs.readFileSync(giveawaysPath));
    const points = JSON.parse(fs.readFileSync(pointsPath));

    const g = data[id];
    if (g.claimed) return interaction.reply({ content: "❌ Already claimed", ephemeral: true });

    g.claimed = true;
    data[id] = g;

    points[g.winner] = (points[g.winner] || 0) + 1;

    fs.writeFileSync(giveawaysPath, JSON.stringify(data, null, 2));
    fs.writeFileSync(pointsPath, JSON.stringify(points, null, 2));

    await interaction.channel.permissionOverwrites.edit(STAFF_ROLE, { SendMessages: false });

    interaction.reply(`✅ Claimed! +1 point given`);
  }

  // 📢 CALL STAFF (3H COOLDOWN)
  if (interaction.customId === "call") {
    const key = interaction.user.id + interaction.channel.id;

    if (cooldowns.has(key) && Date.now() - cooldowns.get(key) < 10800000) {
      return interaction.reply({ content: "⏳ Wait before calling staff again", ephemeral: true });
    }

    cooldowns.set(key, Date.now());

    interaction.reply("📢 Staff notified!");
    interaction.channel.send(`<@&${STAFF_ROLE}> user needs help!`);
  }

  // 🔒 CLOSE BUTTON
  if (interaction.customId === "close") {
    const modal = new ModalBuilder()
      .setCustomId("close_modal")
      .setTitle("Close Ticket");

    const input = new TextInputBuilder()
      .setCustomId("reason")
      .setLabel("Reason")
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    return interaction.showModal(modal);
  }

  // 📝 MODAL SUBMIT
  if (interaction.customId === "close_modal") {
    const reason = interaction.fields.getTextInputValue("reason");

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const transcript = messages.map(m => `${m.author.tag}: ${m.content}`).reverse().join("\n");

    const filePath = path.join(__dirname, `../transcript-${interaction.channel.id}.txt`);
    fs.writeFileSync(filePath, transcript);

    const logChannel = interaction.guild.channels.cache.get(TRANSCRIPT_CHANNEL);

    logChannel.send({
      content: `📄 Transcript | Reason: ${reason}`,
      files: [filePath]
    });

    interaction.user.send({
      content: `Your ticket closed\nReason: ${reason}`,
      files: [filePath]
    }).catch(() => {});

    interaction.reply("🔒 Closing...");
    setTimeout(() => interaction.channel.delete(), 3000);
  }

};