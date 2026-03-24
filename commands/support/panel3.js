const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel3")
    .setDescription("Send carrier panel"),

  async execute(interaction) {

    // silent reply (no command message visible)
    await interaction.deferReply({ ephemeral: true });

    // ===== EMBED =====
    const embed = new EmbedBuilder()
      .setColor("#2B2D31")
      .setTitle("Skylane Giveaways • Carries Panel")
      .setDescription(
`Welcome to **Skylane Giveaways Carries Support**

Need help crushing **Dungeons** or grinding **Slayers**? You're in the right place! Our team of trusted carriers will get you through any floor or boss fast, safe, and for a **reasonable price**.

**Open a Ticket** below to start your carry! Select the service that matches what you need.

We aim to respond as quickly as possible, but delays may occur due to workload. If no response within 2 hours, click **Call Staff**.

Please avoid tagging staff directly.

**Thank you for choosing us!** Every run supports the community.

Ready to dominate your friends?  
**Pick a category below and let's carry you to victory!**`
      )
      .setFooter({ text: "Skylane Giveaways • Carries System" });

    // ===== DROPDOWN =====
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("carrier_panel")
        .setPlaceholder("Select carry type...")
        .addOptions([
          {
            label: "Slayer Carry",
            description: "Request a slayer carry",
            value: "slayer_carry",
            emoji: "⚔️"
          },
          {
            label: "Dungeon Carry",
            description: "Request a dungeon carry",
            value: "dungeon_carry",
            emoji: "🏰"
          }
        ])
    );

    // send panel
    await interaction.channel.send({
      embeds: [embed],
      components: [menu]
    });

    // delete slash reply
    await interaction.deleteReply();
  }
};