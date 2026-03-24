const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = (client) => {
  const LOG_CHANNEL = "1459179660859670659"; // message delete/edit
  const MEMBER_LOG = "1430362658590163025"; // join/leave
  const ROLE_LOG = "1430362275809726614"; // role updates
  const SERVER_LOG = "1430362098357112893"; // server changes

  // ---------------- MESSAGE DELETE ----------------
  client.on("messageDelete", async (message) => {
    if (!message.guild || message.author?.bot) return;
    const ch = message.guild.channels.cache.get(LOG_CHANNEL);
    if (!ch) return;

    let description = `**User:** ${message.author.tag} (${message.author.id})\n**Channel:** ${message.channel}\n`;
    if (message.content) description += `**Content:** ${message.content}`;
    if (message.attachments.size > 0) {
      const files = message.attachments.map((a) => a.proxyURL).join("\n");
      description += `\n**Attachments:**\n${files}`;
    }

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🗑 Message Deleted")
      .setDescription(description || "No content")
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- MESSAGE UPDATE ----------------
  client.on("messageUpdate", async (oldMsg, newMsg) => {
    if (!oldMsg.guild || oldMsg.author?.bot) return;
    if (oldMsg.content === newMsg.content) return;
    const ch = oldMsg.guild.channels.cache.get(LOG_CHANNEL);
    if (!ch) return;

    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("✏ Message Edited")
      .setDescription(
        `**User:** ${oldMsg.author.tag} (${oldMsg.author.id})\n**Channel:** ${oldMsg.channel}\n\n` +
        `**Before:** ${oldMsg.content || "None"}\n` +
        `**After:** ${newMsg.content || "None"}`
      )
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- MEMBER JOIN ----------------
  client.on("guildMemberAdd", (member) => {
    const ch = member.guild.channels.cache.get(MEMBER_LOG);
    if (!ch) return;

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("👋 Member Joined")
      .setDescription(`**User:** <@${member.id}>`)
      .addFields(
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: "Total Members", value: `${member.guild.memberCount}`, inline: true }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- MEMBER LEAVE ----------------
  client.on("guildMemberRemove", (member) => {
    const ch = member.guild.channels.cache.get(MEMBER_LOG);
    if (!ch) return;

    const embed = new EmbedBuilder()
      .setColor("DarkRed")
      .setTitle("👋 Member Left")
      .setDescription(`**User:** <@${member.id}>`)
      .addFields(
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: "Total Members", value: `${member.guild.memberCount}`, inline: true }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- MEMBER ROLE UPDATE ----------------
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const ch = oldMember.guild.channels.cache.get(ROLE_LOG);
    if (!ch) return;

    const oldRoles = oldMember.roles.cache.map(r => r.id).filter(r => r !== oldMember.guild.id);
    const newRoles = newMember.roles.cache.map(r => r.id).filter(r => r !== newMember.guild.id);

    const added = newRoles.filter(r => !oldRoles.includes(r));
    const removed = oldRoles.filter(r => !newRoles.includes(r));
    if (!added.length && !removed.length) return;

    let executor = "Unknown";
    try {
      const logs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === newMember.id) executor = `<@${entry.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("🛡 Member Roles Updated")
      .setDescription(`**User:** <@${newMember.id}>\n**Moderator:** ${executor}`)
      .addFields(
        { name: "Added Roles", value: added.length ? added.map(r => `<@&${r}>`).join(", ") : "None", inline: true },
        { name: "Removed Roles", value: removed.length ? removed.map(r => `<@&${r}>`).join(", ") : "None", inline: true }
      )
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- SERVER UPDATE ----------------
  client.on("guildUpdate", async (oldGuild, newGuild) => {
    const ch = newGuild.channels.cache.get(SERVER_LOG);
    if (!ch) return;

    let executor = "Unknown";
    try {
      const logs = await newGuild.fetchAuditLogs({ type: AuditLogEvent.GuildUpdate, limit: 1 });
      const entry = logs.entries.first();
      if (entry) executor = `<@${entry.executor.id}>`;
    } catch {}

    const changes = [];
    if (oldGuild.name !== newGuild.name) changes.push(`**Name:** ${oldGuild.name} → ${newGuild.name}`);
    if (oldGuild.iconURL() !== newGuild.iconURL()) changes.push(`**Icon Changed**`);
    if (oldGuild.description !== newGuild.description) changes.push(`**Description:** ${oldGuild.description || "None"} → ${newGuild.description || "None"}`);
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) changes.push(`**Verification Level:** ${oldGuild.verificationLevel} → ${newGuild.verificationLevel}`);
    if (!changes.length) return;

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("🏰 Server Updated")
      .setDescription(changes.join("\n"))
      .addFields({ name: "Moderator", value: executor })
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- CHANNEL CREATE ----------------
  client.on("channelCreate", async (channel) => {
    const ch = channel.guild.channels.cache.get(SERVER_LOG);
    if (!ch) return;

    let executor = "Unknown";
    try {
      const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === channel.id) executor = `<@${entry.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("📂 Channel Created")
      .setDescription(`**Channel:** ${channel.name} (${channel.id})\n**Type:** ${channel.type}`)
      .addFields({ name: "Moderator", value: executor })
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- CHANNEL DELETE ----------------
  client.on("channelDelete", async (channel) => {
    const ch = channel.guild.channels.cache.get(SERVER_LOG);
    if (!ch) return;

    let executor = "Unknown";
    try {
      const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === channel.id) executor = `<@${entry.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("📂 Channel Deleted")
      .setDescription(`**Channel:** ${channel.name} (${channel.id})\n**Type:** ${channel.type}`)
      .addFields({ name: "Moderator", value: executor })
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- EMOJI CREATE ----------------
  client.on("emojiCreate", async (emoji) => {
    const ch = emoji.guild.channels.cache.get(SERVER_LOG);
    if (!ch) return;

    let executor = "Unknown";
    try {
      const logs = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiCreate, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === emoji.id) executor = `<@${entry.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("😃 Emoji Created")
      .setDescription(`**Emoji:** ${emoji.name} (${emoji.id})\n**Animated:** ${emoji.animated}`)
      .addFields({ name: "Moderator", value: executor })
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- EMOJI DELETE ----------------
  client.on("emojiDelete", async (emoji) => {
    const ch = emoji.guild.channels.cache.get(SERVER_LOG);
    if (!ch) return;

    let executor = "Unknown";
    try {
      const logs = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === emoji.id) executor = `<@${entry.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("😢 Emoji Deleted")
      .setDescription(`**Emoji:** ${emoji.name} (${emoji.id})\n**Animated:** ${emoji.animated}`)
      .addFields({ name: "Moderator", value: executor })
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });

  // ---------------- EMOJI UPDATE ----------------
  client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
    const ch = newEmoji.guild.channels.cache.get(SERVER_LOG);
    if (!ch) return;

    let executor = "Unknown";
    try {
      const logs = await newEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target.id === newEmoji.id) executor = `<@${entry.executor.id}>`;
    } catch {}

    const changes = [];
    if (oldEmoji.name !== newEmoji.name) changes.push(`**Name:** ${oldEmoji.name} → ${newEmoji.name}`);
    if (oldEmoji.animated !== newEmoji.animated) changes.push(`**Animated:** ${oldEmoji.animated} → ${newEmoji.animated}`);
    if (!changes.length) return;

    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("😃 Emoji Updated")
      .setDescription(changes.join("\n"))
      .addFields({ name: "Moderator", value: executor })
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  });
};