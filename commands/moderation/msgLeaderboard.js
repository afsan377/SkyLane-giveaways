const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getLeaderboard } = require("../../data/messageCounts");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("msg_leaderboard")
    .setDescription("Shows the top message senders in the server"),

  /**
   * Unified execute function for both slash and prefix commands
   * @param {Object} context Slash interaction or Message object
   */
  async execute(context) {
    const isInteraction = !!context.guild && !!context.reply;
    const guild = context.guild;
    const author = context.user || context.author;

    const reply = isInteraction
      ? (options) => context.reply(options)
      : (options) => context.channel.send(options.embeds || options.content);

    const leaderboard = getLeaderboard(guild.id);
    if (!leaderboard.length) return reply({ content: "No messages counted yet!", ephemeral: true });

    let page = 0;
    const totalPages = Math.ceil(leaderboard.length / 10);

    const generateEmbed = (page) => {
      const slice = leaderboard.slice(page * 10, (page + 1) * 10);
      return new EmbedBuilder()
        .setTitle("📝 Top Message Senders")
        .setColor("Blue")
        .setDescription(
          slice.map((u, i) => `**${page * 10 + i + 1}.** <@${u.id}> — **${u.count} messages**`).join("\n")
        )
        .addFields({ name: "Usage", value: "You can also use: `+lb m`" })
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
        .setTimestamp();
    };

    // Only slash commands get buttons
    if (isInteraction) {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Primary).setDisabled(page === 0),
          new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Primary).setDisabled(page === totalPages - 1)
        );

      const msg = await context.reply({ embeds: [generateEmbed(page)], components: [row], fetchReply: true });

      const collector = msg.createMessageComponentCollector({ time: 60000 });
      collector.on("collect", i => {
        if (i.user.id !== author.id) return i.reply({ content: "❌ You can't use these buttons.", ephemeral: true });

        if (i.customId === "next") page++;
        if (i.customId === "prev") page--;

        i.update({
          embeds: [generateEmbed(page)],
          components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Primary).setDisabled(page === 0),
              new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Primary).setDisabled(page === totalPages - 1)
            )
          ]
        });
      });
    } else {
      // Prefix command: only show first page
      reply({ embeds: [generateEmbed(page)] });
    }
  }
};