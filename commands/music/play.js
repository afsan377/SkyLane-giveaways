const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const play = require("play-dl");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .addStringOption(option =>
      option.setName("query")
        .setDescription("Song name or URL")
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString("query");

    const member = await interaction.guild.members.fetch(interaction.user.id);
const voiceChannel = member.voice.channel;
    if (!voiceChannel)
      return interaction.reply({ content: "❌ Join a voice channel first", ephemeral: true });

    await interaction.deferReply();

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      let stream;

      if (play.yt_validate(query) === "video") {
        stream = await play.stream(query);
      } else {
        const search = await play.search(query, { limit: 1 });
        stream = await play.stream(search[0].url);
      }

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      const player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        interaction.editReply(`🎶 Playing: **${query}**`);
      });

      player.on("error", () => {
        interaction.editReply("❌ Error playing song");
      });

    } catch (err) {
      console.error(err);
      interaction.editReply("❌ Failed to play");
    }
  }
};