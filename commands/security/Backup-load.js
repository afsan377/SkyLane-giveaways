const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("backup-load")
    .setDescription("Restore server backup")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    const FILE = "./data/backup.json";

    if (!fs.existsSync(FILE)) {
      return interaction.reply("❌ No backup found.");
    }

    const data = JSON.parse(fs.readFileSync(FILE));
    const backup = data[interaction.guild.id];

    if (!backup) {
      return interaction.reply("❌ No backup for this server.");
    }

    for (const ch of backup.channels) {
      await interaction.guild.channels.create({
        name: ch.name,
        type: ch.type
      }).catch(() => {});
    }

    for (const role of backup.roles) {
      await interaction.guild.roles.create({
        name: role.name,
        color: role.color,
        permissions: role.permissions
      }).catch(() => {});
    }

    interaction.reply("♻️ Server restored from backup!");
  }
};