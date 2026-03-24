const {
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const fs = require("fs");

module.exports = (client) => {

  const POINTS_FILE = "./data/points.json";
  const EXPIRY_FILE = "./data/shop_expiry.json";
  const LOG_CHANNEL = "1437309673262022809";

  const PRICES = {
    role_1m: 50,
    role_2m: 80,
    color_1m: 100,
    vip: 120
  };

  const DURATIONS = {
    role_1m: 30 * 24 * 60 * 60 * 1000,
    role_2m: 60 * 24 * 60 * 60 * 1000,
    color_1m: 30 * 24 * 60 * 60 * 1000,
    vip: 30 * 24 * 60 * 60 * 1000
  };

  const VIP_ROLE_ID = "1464642334947020913";

  // ================= INTERACTION =================
  client.on("interactionCreate", async (interaction) => {
    try {

      // ===== DROPDOWN =====
      if (interaction.isStringSelectMenu() && interaction.customId === "shop_panel") {

        const selected = interaction.values[0];

        if (["role_1m", "role_2m", "color_1m"].includes(selected)) {

          const modal = new ModalBuilder()
            .setCustomId(`shop_${selected}`)
            .setTitle("Shop Purchase");

          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("role_name")
                .setLabel("Role Name")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("color")
                .setLabel("Hex Color (#ff0000)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );

          return interaction.showModal(modal);
        }

        if (selected === "vip") return handleVIP(interaction);
      }

      // ===== MODAL =====
      if (interaction.isModalSubmit() && interaction.customId.startsWith("shop_")) {

        try {
          await interaction.deferReply({ ephemeral: true }); // ✅ FIX

          const type = interaction.customId.replace("shop_", "");
          const roleName = interaction.fields.getTextInputValue("role_name");
          const color = interaction.fields.getTextInputValue("color");

          if (!roleName || roleName.length < 2)
            return interaction.editReply("❌ Invalid role name");

          if (!/^#?[0-9A-Fa-f]{6}$/.test(color))
            return interaction.editReply("❌ Invalid hex color");

          const finalColor = color.startsWith("#") ? color : `#${color}`;

          let points = load(POINTS_FILE);
          if (!points[interaction.user.id]) points[interaction.user.id] = 0;

          if (points[interaction.user.id] < PRICES[type])
            return interaction.editReply(`❌ Need ${PRICES[type]} points`);

          // deduct
          points[interaction.user.id] -= PRICES[type];
          save(POINTS_FILE, points);

          // create role
          const role = await interaction.guild.roles.create({
            name: roleName,
            color: finalColor,
            reason: `Shop purchase by ${interaction.user.tag}`
          });

          // ✅ SAFE ROLE ADD (FIXED BUG)
          const member = await interaction.guild.members.fetch(interaction.user.id);
          await member.roles.add(role);

          // save expiry
          addExpiry(interaction.guild.id, role.id, interaction.user.id, type);

          await interaction.editReply(`✅ Role created: ${role}`);

          log(interaction, role.name, PRICES[type]);

        } catch (err) {
          console.log("SHOP MODAL ERROR:", err);

          if (interaction.deferred || interaction.replied) {
            interaction.editReply("❌ Something went wrong");
          } else {
            interaction.reply({ content: "❌ Error occurred", ephemeral: true });
          }
        }
      }

      // ===== VIP =====
      async function handleVIP(interaction) {
        try {
          await interaction.deferReply({ ephemeral: true });

          let points = load(POINTS_FILE);
          if (!points[interaction.user.id]) points[interaction.user.id] = 0;

          if (points[interaction.user.id] < PRICES.vip)
            return interaction.editReply("❌ Not enough points");

          points[interaction.user.id] -= PRICES.vip;
          save(POINTS_FILE, points);

          const member = await interaction.guild.members.fetch(interaction.user.id);
          await member.roles.add(VIP_ROLE_ID);

          addExpiry(interaction.guild.id, VIP_ROLE_ID, interaction.user.id, "vip");

          await interaction.editReply("💎 VIP given!");

          log(interaction, "VIP Role", PRICES.vip);

        } catch (err) {
          console.log("VIP ERROR:", err);
          interaction.editReply("❌ Failed to give VIP");
        }
      }

      // ===== FUNCTIONS =====
      function load(file) {
        if (!fs.existsSync(file)) return {};
        return JSON.parse(fs.readFileSync(file));
      }

      function save(file, data) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
      }

      function addExpiry(guildId, roleId, userId, type) {
        let data = load(EXPIRY_FILE);

        if (!data[guildId]) data[guildId] = [];

        data[guildId].push({
          roleId,
          userId,
          expires: Date.now() + DURATIONS[type]
        });

        save(EXPIRY_FILE, data);
      }

      function log(interaction, item, price) {
        const ch = interaction.guild.channels.cache.get(LOG_CHANNEL);
        if (!ch) return;

        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle("🛒 Shop Log")
          .addFields(
            { name: "User", value: `${interaction.user}`, inline: true },
            { name: "Item", value: item, inline: true },
            { name: "Cost", value: `${price}`, inline: true }
          )
          .setTimestamp();

        ch.send({ embeds: [embed] });
      }

    } catch (err) {
      console.log("shop error:", err);
    }
  });

  // ================= AUTO REMOVE SYSTEM =================
  setInterval(async () => {
    try {
      let data = {};
      if (fs.existsSync(EXPIRY_FILE))
        data = JSON.parse(fs.readFileSync(EXPIRY_FILE));

      for (const guildId in data) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;

        const updated = [];

        for (const entry of data[guildId]) {
          if (Date.now() >= entry.expires) {
            const member = await guild.members.fetch(entry.userId).catch(() => null);
            const role = guild.roles.cache.get(entry.roleId);

            if (member && role) {
              await member.roles.remove(role).catch(() => {});
            }
          } else {
            updated.push(entry);
          }
        }

        data[guildId] = updated;
      }

      fs.writeFileSync(EXPIRY_FILE, JSON.stringify(data, null, 2));

    } catch (err) {
      console.log("expiry error:", err);
    }
  }, 60 * 1000);
};