const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel5")
    .setDescription("Send verification panel"),

  async execute(interaction) {

    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor("#2B2D31")
      .setTitle("🔐 Skylane Verification System")
      .setDescription(`
Welcome to **Skylane Giveaways**!

To access all giveaways, features, and community perks, you must complete a quick verification process.

━━━━━━━━━━━━━━━━━━

• Click **Start Verification** below  
• Answer a few simple questions in DMs  
• Our staff will review your submission  

━━━━━━━━━━━━━━━━━━

⚠️ Make sure your DMs are open  
⚠️ Provide correct information to avoid rejection  

Once approved, you’ll gain full access to the server.

━━━━━━━━━━━━━━━━━━

**Click below to begin your verification!**
      `)
      .setFooter({ text: "Skylane Giveaways • Verification System" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("start_verification")
        .setLabel("Start Verification")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.deleteReply();
  }
};