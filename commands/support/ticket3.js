const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");
const fs = require("fs");

module.exports = (client) => {

  const CARRIER_ROLE = "1458802339358970009";

  const SLAYER_CATEGORY = "1464941994592702545";
  const DUNGEON_CATEGORY = "1479064801693929635";

  const POINTS_FILE = "./carrier_points.json";

  const claimed = new Map();
  const cooldown = new Set();

  // ================= INTERACTION =================
  client.on("interactionCreate", async (interaction) => {
    try {

      // ===== COOLDOWN (ANTI LAG) =====
      if (cooldown.has(interaction.user.id)) return;
      cooldown.add(interaction.user.id);
      setTimeout(() => cooldown.delete(interaction.user.id), 2000);

      // ================= DROPDOWN =================
      if (interaction.isStringSelectMenu() && interaction.customId === "carrier_panel") {

        if (interaction.values[0] === "slayer_carry") {
          const modal = new ModalBuilder()
            .setCustomId("slayer_modal")
            .setTitle("Slayer Carry");

          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("ign").setLabel("IGN").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("slayer").setLabel("Slayer Type").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("amount").setLabel("Carries").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("tier").setLabel("Tier").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("extra").setLabel("Extra").setStyle(TextInputStyle.Paragraph)
            )
          );

          return interaction.showModal(modal);
        }

        if (interaction.values[0] === "dungeon_carry") {
          const modal = new ModalBuilder()
            .setCustomId("dungeon_modal")
            .setTitle("Dungeon Carry");

          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("ign").setLabel("IGN").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("floor").setLabel("Floor").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("amount").setLabel("Carries").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("tier").setLabel("Tier").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("extra").setLabel("Extra").setStyle(TextInputStyle.Paragraph)
            )
          );

          return interaction.showModal(modal);
        }
      }

      // ================= MODAL =================
      if (interaction.isModalSubmit()) {

        await interaction.deferReply({ flags: 64 });

        const ign = interaction.fields.getTextInputValue("ign");
        const amount = interaction.fields.getTextInputValue("amount");
        const tier = interaction.fields.getTextInputValue("tier");
        const extra = interaction.fields.getTextInputValue("extra") || "None";

        let details = "";
        let category = "";
        let type = "";

        if (interaction.customId === "slayer_modal") {
          const slayer = interaction.fields.getTextInputValue("slayer");
          type = "Slayer Carry";
          category = SLAYER_CATEGORY;

          details = `IGN: ${ign}\nSlayer: ${slayer}\nAmount: ${amount}\nTier: ${tier}\nExtra: ${extra}`;
        }

        if (interaction.customId === "dungeon_modal") {
          const floor = interaction.fields.getTextInputValue("floor");
          type = "Dungeon Carry";
          category = DUNGEON_CATEGORY;

          details = `IGN: ${ign}\nFloor: ${floor}\nAmount: ${amount}\nTier: ${tier}\nExtra: ${extra}`;
        }

        const channel = await interaction.guild.channels.create({
          name: `${type}-${interaction.user.username}`.toLowerCase().slice(0, 25),
          type: ChannelType.GuildText,
          parent: category,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: CARRIER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
          ]
        });

        const embed = new EmbedBuilder()
          .setColor("#2B2D31")
          .setTitle("🎟️ Carry Ticket")
          .setDescription(`User: ${interaction.user}\n\n${details}`);

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("carry_claim").setLabel("Claim").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("carry_call").setLabel("Call").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("carry_price").setLabel("Prices").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("carry_done").setLabel("Mark Done").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("carry_close").setLabel("Close").setStyle(ButtonStyle.Danger)
        );

        await channel.send({
          content: `${interaction.user} <@&${CARRIER_ROLE}>`,
          embeds: [embed],
          components: [buttons]
        });

        return interaction.editReply({ content: `✅ ${channel}` });
      }

      // ================= BUTTONS =================
      if (interaction.isButton()) {

        // CLAIM
        if (interaction.customId === "carry_claim") {
          await interaction.deferReply({ ephemeral: true });

          if (claimed.has(interaction.channel.id))
            return interaction.editReply(`❌ Already claimed by <@${claimed.get(interaction.channel.id)}>`);

          claimed.set(interaction.channel.id, interaction.user.id);
          return interaction.editReply(`✅ Claimed by ${interaction.user}`);
        }

        // CALL
        if (interaction.customId === "carry_call") {
          await interaction.deferReply({ ephemeral: true });
          interaction.channel.send(`<@&${CARRIER_ROLE}> needed!`);
          return interaction.editReply("📢 Called carrier");
        }

        // PRICE
        if (interaction.customId === "carry_price") {
          await interaction.deferReply({ ephemeral: true });

          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("💰 Carry Prices")
            .setDescription("• Slayer: 1M per carry\n• Dungeon: 2M per run");

          interaction.channel.send({ embeds: [embed] });
          return interaction.editReply("✅ Prices sent");
        }

        // DONE (POINTS)
        if (interaction.customId === "carry_done") {
          await interaction.deferReply({ flags: 64 });

          let points = {};
          if (fs.existsSync(POINTS_FILE))
            points = JSON.parse(fs.readFileSync(POINTS_FILE));

          if (!points[interaction.user.id]) points[interaction.user.id] = 0;
          points[interaction.user.id]++;

          fs.writeFileSync(POINTS_FILE, JSON.stringify(points, null, 2));

          return interaction.editReply(`🎯 You now have ${points[interaction.user.id]} points`);
        }

        // CLOSE
        if (interaction.customId === "carry_close") {
          await interaction.deferReply();
          setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
        }
      }

    } catch (err) {
      console.log("ticket3 error:", err);
    }
  });
};