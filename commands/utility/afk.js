const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Store AFK data
const afkStore = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Set your AFK status")
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for AFK")
        .setRequired(false)
    ),

  async execute(interaction) {
    const reason = interaction.options.getString("reason") || "AFK";

    afkStore.set(interaction.user.id, {
      reason,
      since: Date.now(),
      pings: []
    });

    await interaction.reply({
      content: `💤 You are now AFK: **${reason}**`,
      ephemeral: true
    });
  },

  // ✅ PREFIX +afk
  prefixExecute: async (message, args) => {
    const reason = args.join(" ") || "AFK";

    afkStore.set(message.author.id, {
      reason,
      since: Date.now(),
      pings: []
    });

    await message.reply(`💤 You are now AFK: **${reason}**`);
  },

  afkStore
};