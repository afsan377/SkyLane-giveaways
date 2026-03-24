const { EmbedBuilder } = require("discord.js");
const { addPoints } = require("./points");
const fs = require("fs"); // ✅ NEW

const bullet = "<a:lol:1468631266676183094>";
const cornerEmoji = "https://cdn.discordapp.com/emojis/1481335457764610080.gif";

module.exports = async (client, giveaway) => {

  if (!giveaway) return;

  const channel = await client.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(giveaway.messageId);

  const participants = [...giveaway.participants];

  let winnersText = "No one";
  let winners = []; // ✅ NEW

  if (participants.length > 0) {

    const shuffled = participants.sort(() => 0.5 - Math.random());
    winners = shuffled.slice(0, giveaway.winners);

    winnersText = winners.map(id => `<@${id}>`).join(", ");

    // ✅ Send winner message
    channel.send(`🎉 Congratulations ${winnersText}! You won **${giveaway.prize}**\nReroll ID: ${giveaway.messageId}`);
  }

  /* ================= SAVE FIX (VERY IMPORTANT) ================= */

  giveaway.winners = winners; // ✅ FIX: store IDs instead of number
  giveaway.ended = true; // ✅ NEW
  giveaway.endedAt = Date.now(); // ✅ NEW

  /* ================= POINTS SYSTEM ================= */
  try {
    const newPoints = addPoints(giveaway.host.id, 1);

    const logChannel = client.channels.cache.get("1430361956367470652");

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setDescription(
`+1 point given to ${giveaway.host} for hosting **${giveaway.prize}**

Total points: **${newPoints}**`
        );

      logChannel.send({ embeds: [logEmbed] });
    }

  } catch (err) {
    console.error("Points error:", err);
  }

  /* ================= END EMBED ================= */

  const endedEmbed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle(`🎁 ${giveaway.prize} 🎁`)
    .setThumbnail(cornerEmoji)
    .setDescription(
`Congratulations ${winnersText}!

${bullet} Winners: **${winners.length} 
(${winnersText})**
${bullet} Participants: **${participants.length}**
${bullet} Started at: <t:${giveaway.start}:F>
${bullet} Ended: <t:${Math.floor(Date.now()/1000)}:F>
${bullet} Duration: **${giveaway.duration}**
${bullet} Hosted by: ${giveaway.host}
${bullet} Prize: **${giveaway.prize}**

Ended giveaway!`
    );

  await message.edit({
    embeds: [endedEmbed],
    components: []
  });

  /* ================= SAVE FILE ================= */

  const data = {};

  client.endedGiveaways.set(giveaway.messageId, giveaway);

  client.endedGiveaways.forEach((g, id) => {
    data[id] = {
      ...g,
      participants: Array.from(g.participants)
    };
  });

  fs.writeFileSync("./giveaways.json", JSON.stringify(data, null, 2));

  client.giveaways.delete(giveaway.messageId);
};