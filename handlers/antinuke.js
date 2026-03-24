const { AuditLogEvent, PermissionsBitField } = require("discord.js");
const fs = require("fs");

module.exports = (client) => {

  const FILE = "./data/antinuke.json";

  const LIMITS = {
    channelDelete: 2,
    roleDelete: 2,
    channelCreate: 3,
    roleCreate: 3,
    ban: 2,
    kick: 2,
    botAdd: 1
  };

  const actions = new Map();
  let joins = [];

  const load = () => JSON.parse(fs.readFileSync(FILE));

  const isWhitelisted = (member, data) => {
    if (!member) return false;
    if (data.whitelist.users.includes(member.id)) return true;
    return member.roles.cache.some(r => data.whitelist.roles.includes(r.id));
  };

  const count = (id, type) => {
    if (!actions.has(id)) actions.set(id, {});
    const d = actions.get(id);
    d[type] = (d[type] || 0) + 1;
    setTimeout(() => d[type] = 0, 10000);
    return d[type];
  };

  const punish = async (guild, member, reason, ban = false) => {
    try {
      if (ban) return member.ban({ reason });
      await member.roles.set([]);
      await member.timeout(15 * 60 * 1000, reason);
    } catch {}
  };

  const handle = async (guild, type, limit, executorId) => {
    const data = load();
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (!member || isWhitelisted(member, data)) return;

    if (count(executorId, type) >= limit) {
      punish(guild, member, type);
    }
  };

  // 🚨 ADMIN ROLE = BAN
  client.on("guildMemberUpdate", async (oldM, newM) => {
    const added = newM.roles.cache.filter(r => !oldM.roles.cache.has(r.id));

    for (const role of added.values()) {
      if (role.permissions.has(PermissionsBitField.Flags.Administrator)) {

        const logs = await newM.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberRoleUpdate,
          limit: 1
        });

        const exec = logs.entries.first()?.executor;
        if (!exec) return;

        const member = await newM.guild.members.fetch(exec.id).catch(() => null);
        const data = load();

        if (!member || isWhitelisted(member, data)) return;

        punish(newM.guild, member, "Gave admin role", true);
      }
    }
  });

  // EVENTS
  client.on("channelDelete", async c => {
    const e = (await c.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 })).entries.first();
    if (e) handle(c.guild, "channelDelete", LIMITS.channelDelete, e.executor.id);
  });

  client.on("channelCreate", async c => {
    const e = (await c.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 })).entries.first();
    if (e) handle(c.guild, "channelCreate", LIMITS.channelCreate, e.executor.id);
  });

  client.on("roleDelete", async r => {
    const e = (await r.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 })).entries.first();
    if (e) handle(r.guild, "roleDelete", LIMITS.roleDelete, e.executor.id);
  });

  client.on("roleCreate", async r => {
    const e = (await r.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 })).entries.first();
    if (e) handle(r.guild, "roleCreate", LIMITS.roleCreate, e.executor.id);
  });

  client.on("guildBanAdd", async b => {
    const e = (await b.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 })).entries.first();
    if (e) handle(b.guild, "ban", LIMITS.ban, e.executor.id);
  });

  client.on("guildMemberRemove", async m => {
    const e = (await m.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 })).entries.first();
    if (e) handle(m.guild, "kick", LIMITS.kick, e.executor.id);
  });

  client.on("guildMemberAdd", async m => {

    const data = load();

    // anti alt
    if (Date.now() - m.user.createdTimestamp < 2 * 86400000) {
      m.timeout(10 * 60 * 1000).catch(() => {});
    }

    // raid detect
    joins.push(Date.now());
    joins = joins.filter(t => Date.now() - t < 10000);

    if (joins.length >= 5) {
      m.guild.channels.cache.forEach(c => {
        c.permissionOverwrites.edit(m.guild.id, { SendMessages: false }).catch(() => {});
      });
    }

    // bot add
    if (m.user.bot) {
      const e = (await m.guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 })).entries.first();
      if (!e) return;

      const exec = await m.guild.members.fetch(e.executor.id).catch(() => null);
      if (!exec || isWhitelisted(exec, data)) return;

      punish(m.guild, exec, "Bot add", true);
    }
  });

};