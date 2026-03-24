const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const config = require("./config.json");
const token = process.env.TOKEN;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// ------------------- COLLECTIONS & MAPS -------------------
client.commands = new Collection();
client.giveaways = new Map();
client.endedGiveaways = new Map();
client.warnings = new Map();

const joinCooldown = new Map();
const giveawayLocks = new Set();
const callCooldown = new Map();

// ✅ UPGRADED AFK STORE
const afk = new Map();

const prefix = "+";

// ------------------- GIVEAWAY JSON -------------------
function loadGiveaways() {
  if (!fs.existsSync("./data/giveaways.json")) fs.writeFileSync("./data/giveaways.json", "{}");
  const data = JSON.parse(fs.readFileSync("./data/giveaways.json"));

  for (const id in data) {
    data[id].participants = new Set(data[id].participants);
    client.giveaways.set(id, data[id]);
  }

  console.log("✅ Giveaways loaded");
}

function saveGiveaways() {
  const obj = {};
  client.giveaways.forEach((g, id) => {
    obj[id] = { ...g, participants: Array.from(g.participants) };
  });
  fs.writeFileSync("./data/giveaways.json", JSON.stringify(obj, null, 2));
}

// ------------------- LOAD COMMANDS -------------------
const items = fs.readdirSync("./commands");

for (const item of items) {
  const fullPath = `./commands/${item}`;

  // ✅ If it's a folder
  if (fs.lstatSync(fullPath).isDirectory()) {
    const files = fs.readdirSync(fullPath).filter(f => f.endsWith(".js"));

    for (const file of files) {
      const command = require(`${fullPath}/${file}`);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }

  // ✅ If it's a file
  else if (item.endsWith(".js")) {
    const command = require(fullPath);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

// ------------------- READY -------------------
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  loadGiveaways();

  const rest = new REST({ version: "10" }).setToken(token);

  const slashCommands = Array.from(client.commands.values())
    .filter(cmd => cmd.data?.toJSON)
    .map(cmd => cmd.data.toJSON());

  const guilds = Array.isArray(config.guildId) ? config.guildId : [config.guildId];

  for (const guildId of guilds) {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, guildId),
      { body: slashCommands }
    );
  }

  console.log("✅ Slash commands registered!");
});

// (everything same above...)

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;


  // ===== REMOVE AFK WHEN USER TALKS (ADVANCED) =====
  if (afk.has(userId)) {
    const data = afk.get(userId);
    afk.delete(userId);

    const time = Math.floor((Date.now() - data.since) / 60);

    let pingList = "No one pinged you 😴";

    if (data.pings.length > 0) {
      pingList = data.pings
        .slice(-5)
        .map(p => `• **${p.user}** → [Jump](${p.link})`)
        .join("\n");
    }

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(` Welcome back ${message.author.username}`)
      .addFields(
        { name: " AFK Time", value: `${time} minutes`, inline: true },
        { name: " Pings While AFK", value: pingList }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }

  // ===== AFK MENTION =====
  message.mentions.users.forEach(user => {
    if (afk.has(user.id)) {
      const data = afk.get(user.id);

      data.pings.push({
        user: message.author.tag,
        time: Date.now(),
        link: `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`
      });

      message.reply(
        `${user.username} is currently AFK for **${data.reason}** - <t:${Math.floor(data.since/1000)}:R>`
      );
    }
  });

  // PREFIX COMMANDS
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();
    
    if (cmd === "lb" && args[0]?.toLowerCase() === "m") {
  const command = client.commands.get("msg_leaderboard");
  if (!command) return;

  return command.execute(message);
}

  // ===== AFK SET =====
  if (cmd === "afk") {
    const reason = args.join(" ") || "AFK";

    afk.set(userId, {
      reason,
      since: Date.now(),
      pings: []
    });

    const embed = new EmbedBuilder()
      .setColor("#2B2D31")
      .setDescription(`💤 You are now AFK\n\n**Reason:** ${reason}`)
      .setFooter({ text: "I will notify others when they mention you" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // ===== PING =====
  if (cmd === "ping") return message.reply("🏓 Pong!");

  // ===== ECHO =====
  if (cmd === "echo") {
      
    const text = args.join(" ");
    if (!text) return message.reply("❌ Provide text");

    message.channel.send(text);

    const logChannel = client.channels.cache.get(config.modLog);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle("📝 Echo Used")
        .setDescription(text)
        .setColor("Yellow");

      logChannel.send({ embeds: [embed] });
    }
  }
});

    // ------------------- INTERACTIONS -------------------
client.on("interactionCreate", async (interaction) => {
  try {

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction, client);
    }

    if (interaction.isButton()) {
      const userId = interaction.user.id;
      const customId = interaction.customId;

      if (joinCooldown.has(userId)) {
        const time = joinCooldown.get(userId) - Date.now();
        if (time > 0)
          return interaction.reply({ content: "⏳ Slow down!", ephemeral: true });
      }

      joinCooldown.set(userId, Date.now() + 3000);

      if (customId.startsWith("join_") || customId.startsWith("leave_")) {
        const messageId = customId.split("_")[1];

        if (giveawayLocks.has(messageId))
          return interaction.reply({ content: "⏳ Processing...", ephemeral: true });

        giveawayLocks.add(messageId);
        await interaction.deferReply({ ephemeral: true });

        let giveaway = client.giveaways.get(messageId);

        if (!giveaway) {
          giveaway = {
            messageId,
            channelId: interaction.channel.id,
            participants: new Set(),
            prize: "Unknown Prize"
          };
          client.giveaways.set(messageId, giveaway);
        }

        if (!giveaway.participants) giveaway.participants = new Set();

        if (customId.startsWith("join_")) {
          if (giveaway.participants.has(userId)) {
            giveawayLocks.delete(messageId);

            const leaveBtn = new ButtonBuilder()
              .setCustomId(`leave_${messageId}`)
              .setLabel("Leave Giveaway")
              .setStyle(ButtonStyle.Danger);

            return interaction.editReply({
              content: "⚠️ Already joined!",
              components: [new ActionRowBuilder().addComponents(leaveBtn)]
            });
          }

          giveaway.participants.add(userId);
          saveGiveaways();
          await updateCount(client, giveaway);

          await interaction.editReply({ content: "✅ Joined giveaway!" });
        }

        if (customId.startsWith("leave_")) {
          try {
            if (!giveaway.participants.has(userId)) {
              giveawayLocks.delete(messageId);
              return interaction.editReply({ content: "⚠️ You are not in this giveaway!" });
            }

            giveaway.participants.delete(userId);
            saveGiveaways();
            await updateCount(client, giveaway);

            await interaction.editReply({ content: "❌ Left giveaway" });

          } catch (err) {
            console.error(err);
            await interaction.editReply({ content: "❌ Error leaving giveaway" });
          } finally {
            giveawayLocks.delete(messageId);
          }
        }

        giveawayLocks.delete(messageId);
      }

      if (customId.startsWith("role_")) {
        const roleId = customId.split("_")[1];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return;

        const member = interaction.member;

        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(roleId);
        } else {
          await member.roles.add(roleId);
        }

        return interaction.reply({ content: "✅ Role updated", ephemeral: true });
      }
    }

    if (interaction.isStringSelectMenu()) {

      if (interaction.customId === "selfrole_menu") {
        const member = interaction.member;
        const selected = interaction.values;
        const allRoles = interaction.component.options.map(o => o.value);

        for (const roleId of allRoles) {
          if (!selected.includes(roleId) && member.roles.cache.has(roleId))
            await member.roles.remove(roleId).catch(() => {});
        }

        for (const roleId of selected) {
          if (!member.roles.cache.has(roleId))
            await member.roles.add(roleId).catch(() => {});
        }

        return interaction.reply({ content: "✅ Roles updated", ephemeral: true });
      }
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied)
      await interaction.reply({ content: "❌ Error", ephemeral: true });
  }
});

// ------------------- UPDATE GIVEAWAY COUNT -------------------
async function updateCount(client, giveaway) {
  try {
    const channel = await client.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);

    const embed = message.embeds[0];
    if (!embed) return;

    const updated = EmbedBuilder.from(embed).setDescription(
      embed.description.replace(/Participants: \*\*\d+\*\*/, `Participants: **${giveaway.participants.size}**`)
    );

    await message.edit({ embeds: [updated] });

  } catch {}
}

// ------------------- HANDLERS -------------------
require("./handlers/modLogs")(client);
require("./handlers/messageCounter")(client);
require("./handlers/autoReply")(client);
require("./commands/support/ticket")(client);
require("./interactionCreate2")(client);
require("./commands/support/ticket3")(client);
require("./commands/support/ticket4")(client);
require("./commands/support/ticket5.js")(client);
require("./handlers/antinuke")(client);
require("./handlers/backup")(client);

// ------------------- LOGIN -------------------
client.login(token);
