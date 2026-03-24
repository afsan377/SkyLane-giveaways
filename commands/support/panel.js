const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Send support panel"),

  async execute(interaction) {

    // ===== Embed =====
    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🎟️ Support Panel")
      .setDescription(`
━━━━━━━━━━━━━━━━━━
Welcome to Skylane Giveaways Support Hub!

Need help? You’re in the right place. Our support team is here to assist you with any questions, issues, or concerns you may have.

Open a ticket by choosing the category that best fits your problem. This helps us understand your situation quickly and provide the right solution.

After creating your ticket, please share clear and detailed information. The more details you provide, the faster and smoother we can assist you.

We do our best to respond as quickly as possible. However, during busy times, replies may take a bit longer. If you haven’t received a response within a couple of hours, feel free to use the Call Support option for quicker attention.

Please avoid directly tagging staff members, even if they appear online. This ensures a fair and organized support system for everyone.

We appreciate your patience and cooperation.
Our goal is to make your experience with Skylane smooth, safe, and enjoyable. Your satisfaction always comes first!

✦ Thank you for being part of Skylane ✦
Welcome to the support system!

Please select the option that matches your issue from the menu below.

━━━━━━━━━━━━━━━━━━
      `)
      .setFooter({ text: "Skylane Giveaway Support" });

    // ===== Select Menu =====
    const menu = new StringSelectMenuBuilder()
      .setCustomId("support_panel_1")
      .setPlaceholder("Select your issue")
      .addOptions([
        {
          label: "Giveaway Claim",
          description: "Claim your giveaway reward",
          value: "giveaway",
          emoji: "🎉"
        },
        {
          label: "Role Claim",
          description: "Request a role",
          value: "role",
          emoji: "🎭"
        },
        {
          label: "Punishment Appeal",
          description: "Appeal your punishment",
          value: "appeal",
          emoji: "⚖️"
        },
        {
          label: "Other",
          description: "Other issues",
          value: "other",
          emoji: "❓"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    // ===== Send panel publicly =====
    await interaction.channel.send({ embeds: [embed], components: [row] });

    // ===== IMPORTANT FIX: no stuck interaction =====
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: "✅ Support panel sent." });
  }
};