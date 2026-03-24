const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel2")
    .setDescription("Send the working sponsorship panel"),

  async execute(interaction) {
    // ===== Embed =====
    const embed = new EmbedBuilder()
      .setColor("#2B2D31")
      .setTitle("Skylane Giveaways • Sponsorship Panel")
      .setDescription(
`Welcome to **Skylane Giveaways Sponsorships**!  

Do you want to share your amazing moments, promote yourself, or support the community by sponsoring a giveaway?  

• Click **Open a Ticket** below to request a sponsored giveaway.  
• Our team will handle your request promptly.  
• If no response within 2 hours, click **Call Staff** for faster assistance.  
• Please avoid tagging staff directly.  

Thank you for supporting **Skylane Giveaways**! We appreciate your generosity and enthusiasm.`
      )
      .setFooter({ text: "Skylane Giveaways • Supporting our community together" });

    // ===== Dropdown Menu =====
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("sponsor_panel")
        .setPlaceholder("Select an option...")
        .addOptions([
          { label: "Open a Ticket", description: "Request a sponsored giveaway", value: "sponsor_ticket" }
        ])
    );

    // Send panel publicly in channel
    await interaction.channel.send({ embeds: [embed], components: [menu] });

    // Send **tiny ephemeral confirmation** instead of deleting deferred reply
    await interaction.reply({ content: "✅ Panel sent.", ephemeral: true });
  },
};