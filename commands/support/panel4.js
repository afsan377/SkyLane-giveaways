const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel4")
    .setDescription("Send shop panel"),

  async execute(interaction) {

    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor("#2B2D31")
      .setTitle("🛒 Skylane Giveaways • Shop")
      .setDescription(
`Welcome to the **Skylane Shop**!

━━━━━━━━━━━━━━━━━━

🧩 **Items Available**

🎨 1 Month Custom Role — 50 Points  
🎨 2 Month Custom Role — 80 Points  
🌈 Custom Role Color (1 Month) — 100 Points  
💎 VIP Role (1 Month) — 120 Points *(NEW)*  
📢 Server Advertisement — 70 Points *(NEW)*  

━━━━━━━━━━━━━━━━━━

Select item below to purchase.`
      );

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("shop_panel")
        .setPlaceholder("Select item")
        .addOptions([
          { label: "1 Month Custom Role", value: "role_1m", emoji: "🎨" },
          { label: "2 Month Custom Role", value: "role_2m", emoji: "🎨" },
          { label: "Custom Role Color (1M)", value: "color_1m", emoji: "🌈" },
          { label: "VIP Role (1M)", value: "vip", emoji: "💎" },
          { label: "Server Advertisement", value: "ad", emoji: "📢" }
        ])
    );

    await interaction.channel.send({ embeds: [embed], components: [menu] });

    await interaction.deleteReply();
  }
};