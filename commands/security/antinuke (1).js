const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const FILE = "./data/antinuke.json";

function load() {
  if (!fs.existsSync(FILE)) return { whitelist: { users: [], roles: [] } };
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antinuke")
    .setDescription("Manage anti-nuke system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(s =>
      s.setName("whitelist-add")
        .setDescription("Add user/role to whitelist")
        .addUserOption(o => o.setName("user").setDescription("User"))
        .addRoleOption(o => o.setName("role").setDescription("Role"))
    )

    .addSubcommand(s =>
      s.setName("whitelist-remove")
        .setDescription("Remove user/role from whitelist")
        .addUserOption(o => o.setName("user").setDescription("User"))
        .addRoleOption(o => o.setName("role").setDescription("Role"))
    )

    .addSubcommand(s =>
      s.setName("whitelist-list")
        .setDescription("Show whitelist")
    ),

  async execute(interaction) {

    const data = load();
    const sub = interaction.options.getSubcommand();

    // ADD
    if (sub === "whitelist-add") {
      const user = interaction.options.getUser("user");
      const role = interaction.options.getRole("role");

      if (!user && !role) {
        return interaction.reply({ content: "❌ Provide user or role", ephemeral: true });
      }

      if (user && !data.whitelist.users.includes(user.id)) {
        data.whitelist.users.push(user.id);
      }

      if (role && !data.whitelist.roles.includes(role.id)) {
        data.whitelist.roles.push(role.id);
      }

      save(data);
      return interaction.reply("✅ Added to whitelist");
    }

    // REMOVE
    if (sub === "whitelist-remove") {
      const user = interaction.options.getUser("user");
      const role = interaction.options.getRole("role");

      if (user) {
        data.whitelist.users = data.whitelist.users.filter(x => x !== user.id);
      }

      if (role) {
        data.whitelist.roles = data.whitelist.roles.filter(x => x !== role.id);
      }

      save(data);
      return interaction.reply("✅ Removed from whitelist");
    }

    // LIST
    if (sub === "whitelist-list") {
      return interaction.reply({
        content:
          `👤 **Users:**\n${data.whitelist.users.map(id => `<@${id}>`).join("\n") || "None"}\n\n` +
          `🎭 **Roles:**\n${data.whitelist.roles.map(id => `<@&${id}>`).join("\n") || "None"}`
      });
    }
  }
};