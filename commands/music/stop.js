const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop music"),

  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);

    if (!connection)
      return interaction.reply({ content: "❌ Nothing is playing", ephemeral: true });

    connection.destroy();

    interaction.reply("⏹️ Stopped music");
  }
};