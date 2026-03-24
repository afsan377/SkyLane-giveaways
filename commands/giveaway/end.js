const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveawayend")
    .setDescription("End an ongoing giveaway immediately")
    .addStringOption(option =>
      option.setName("messageid")
        .setDescription("ID of the giveaway message")
        .setRequired(true)
    ),

  async execute(interaction, client) {

    const messageId = interaction.options.getString("messageid");

    let giveaway = client.giveaways.get(messageId);

    if (!giveaway) {
      giveaway = client.endedGiveaways?.get(messageId);
      if (giveaway) {
        return interaction.reply({ content: "⚠️ Already ended!", flags: 64 });
      }
      return interaction.reply({ content: "❌ Giveaway not found!", flags: 64 });
    }

    const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) return interaction.reply({ content: "❌ Channel not found", flags: 64 });

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
    if (!message) return interaction.reply({ content: "❌ Message not found", flags: 64 });

    const participants = Array.from(giveaway.participants);

    if (participants.length === 0) {
      await interaction.reply({ content: "❌ No participants", flags: 64 });
      client.giveaways.delete(messageId);
      return;
    }

    // 🎉 PICK WINNERS
    const winners = [];
    for (let i = 0; i < (giveaway.winners || 1); i++) {
      const index = Math.floor(Math.random() * participants.length);
      winners.push(`<@${participants[index]}>`);
      participants.splice(index, 1);
      if (participants.length === 0) break;
    }

    // 🔥 GET ORIGINAL EMBED TEXT
    let oldEmbed = message.embeds[0];

    let newDescription = oldEmbed.description;

    // 🔥 MODIFY ONLY END PART
    newDescription = newDescription.replace(
      /Ends:.*\n/,
      `Ended: <t:${Math.floor(Date.now() / 1000)}:R>\n`
    );

    // ADD WINNERS LINE
    newDescription += `\n🎉 Winners: ${winners.join(", ")}`;

    const newEmbed = new EmbedBuilder()
      .setColor(oldEmbed.color || "#2b2d31")
      .setTitle(oldEmbed.title)
      .setThumbnail(oldEmbed.thumbnail?.url || null)
      .setDescription(newDescription);

    // ❌ REMOVE BUTTON (DISABLE JOIN)
    await message.edit({
      embeds: [newEmbed],
      components: []
    });

    // 🎉 SEND WIN MESSAGE
    await channel.send(`🎉 Congrats ${winners.join(", ")}! You won **${giveaway.prize}**`);

    if (!client.endedGiveaways) client.endedGiveaways = new Map();
    client.endedGiveaways.set(messageId, giveaway);

    client.giveaways.delete(messageId);

    await interaction.reply({ content: "✅ Giveaway ended (clean UI)", flags: 64 });
  }
};