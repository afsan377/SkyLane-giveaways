const fs = require("fs");

module.exports = (client) => {

  const FILE = "./data/backup.json";

  const load = () => fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : {};

  const save = (data) => {
    fs.writeFileSync(
      FILE,
      JSON.stringify(data, (key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      2)
    );
  };

  client.createBackup = async (guild) => {

    const data = {
      channels: guild.channels.cache.map(c => ({
        name: c.name,
        type: c.type
      })),
      roles: guild.roles.cache
        .filter(r => !r.managed)
        .map(r => ({
          name: r.name,
          color: r.color,
          permissions: r.permissions.bitfield.toString() // FIXED HERE
        }))
    };

    const all = load();
    all[guild.id] = data;
    save(all);
  };

  client.on("channelDelete", async (c) => {
    const backup = load()[c.guild.id];
    if (!backup) return;

    const found = backup.channels.find(x => x.name === c.name);
    if (found) {
      c.guild.channels.create({
        name: found.name,
        type: found.type
      }).catch(() => {});
    }
  });

  client.on("roleDelete", async (r) => {
    const backup = load()[r.guild.id];
    if (!backup) return;

    const found = backup.roles.find(x => x.name === r.name);
    if (found) {
      r.guild.roles.create({
        name: found.name,
        color: found.color,
        permissions: BigInt(found.permissions) // FIXED HERE
      }).catch(() => {});
    }
  });

};