const {
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const { createTranscript } = require("discord-html-transcripts");

module.exports = (client) => {

const selectedGiveaway = new Map();
const claimedTickets = new Map();

const STAFF_ROLE = "1478770598078447895";

const CATEGORIES = {
giveaway: "1478769720529522881",
role: "1478771327291625604",
other: "1478771429502877746",
appeal: "1478771388553887898"
};

const TRANSCRIPT_CHANNEL = "1478771637074530539";
const CLAIM_FILE = "./data/claimed.json";

const loadClaims = () =>
fs.existsSync(CLAIM_FILE) ? JSON.parse(fs.readFileSync(CLAIM_FILE)) : {};

const saveClaims = (data) =>
fs.writeFileSync(CLAIM_FILE, JSON.stringify(data, null, 2));

client.on("interactionCreate", async (interaction) => {
try {

// ================= SELECT MENU =================
if (interaction.isStringSelectMenu()) {

if (interaction.customId === "support_panel_1") {
await interaction.deferReply({ ephemeral: true });

// ===== GIVEAWAY =====
if (interaction.values[0] === "giveaway") {

const raw = JSON.parse(fs.readFileSync("./giveaways.json"));
const data = Array.isArray(raw) ? raw : Object.values(raw);
const claimedData = loadClaims();

const now = Date.now();
const won = [];
let description = "";

for (const g of data) {
let winners = Array.isArray(g.winners)
? g.winners
: g.winner
? [g.winner]
: [];

if (!winners.includes(interaction.user.id)) continue;

const endedAt = g.end ? g.end * 1000 : null;
if (!endedAt) continue;
if ((now - endedAt) > 86400000) continue;

const key = `${interaction.user.id}-${g.messageId || g.id}`;
if (claimedData[key]) continue;

won.push({ label: g.prize, value: g.messageId || g.id });
description += `• ${g.prize}\n`;
}

if (!won.length)
return interaction.editReply({ content: "❌ No claimable giveaways. if you cannot find your giveaway even if you won any, create a ticket in other category! we will assist you there." });

const embed = new EmbedBuilder()
.setColor("#2B2D31")
.setTitle("🎁 Giveaway Claims")
.setDescription(`You have these giveaways to claim given below\n\n${description}\nClick on dropdown menu to select!`);

return interaction.editReply({
embeds: [embed],
components: [
new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId("gw_select")
.setPlaceholder("Select giveaway")
.addOptions(won)
),
new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("gw_confirm")
.setLabel("Confirm")
.setStyle(ButtonStyle.Success)
)
]
});
}

// ===== NORMAL TICKETS =====
const type = interaction.values[0];
if (!["appeal","role","other"].includes(type)) return;

const channel = await interaction.guild.channels.create({
name: `${interaction.user.username}-${type}`.slice(0,25),
parent: CATEGORIES[type],
permissionOverwrites: [
{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
{ id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
{ id: STAFF_ROLE, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
]
});

const embed = new EmbedBuilder()
.setColor("#2B2D31")
.setDescription(`Your ${type} ticket has been created.

<@&${STAFF_ROLE}> will assist you shortly.

━━━━━━━━━━━━━━━━━━━━

• Explain your issue clearly
• Attach proof if needed
• Be patient

━━━━━━━━━━━━━━━━━━━━

Support Team • ETA: 15–30 minutes`);

const buttons = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("claim").setLabel("Claim").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("call").setLabel("Call Staff").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("close").setLabel("Close").setStyle(ButtonStyle.Danger)
);

await channel.send({
content: `${interaction.user} <@&${STAFF_ROLE}>`,
embeds: [embed],
components: [buttons]
});

return interaction.editReply({ content: `✅ Ticket created: ${channel}` });
}

// SAVE SELECT
if (interaction.customId === "gw_select") {
selectedGiveaway.set(interaction.user.id, interaction.values[0]);
return interaction.reply({ content: "✅ Selected", ephemeral: true });
}

}

// ================= BUTTONS =================
if (interaction.isButton()) {

// CLAIM
if (interaction.customId === "claim") {

const alreadyClaimed = claimedTickets.get(interaction.channel.id);

if (alreadyClaimed) {
return interaction.reply({
content: `❌ Ticket already claimed by <@${alreadyClaimed}>`,
ephemeral: true
});
}

claimedTickets.set(interaction.channel.id, interaction.user.id);

await interaction.reply({
content: `✅ Ticket claimed by ${interaction.user}`
});

}

// CALL
if (interaction.customId === "call") {
await interaction.reply({
content: `<@&${STAFF_ROLE}> 🚨 Staff requested by ${interaction.user}`,
allowedMentions: { roles: [STAFF_ROLE] }
});
return;
}

// ===== CONFIRM =====
if (interaction.customId === "gw_confirm") {

const selected = selectedGiveaway.get(interaction.user.id);
if (!selected)
return interaction.reply({ content: "❌ Select giveaway first", ephemeral: true });

const claimedData = loadClaims();
const key = `${interaction.user.id}-${selected}`;

if (claimedData[key]) {
return interaction.reply({
content: "❌ You already claimed this giveaway!",
ephemeral: true
});
}

const raw = JSON.parse(fs.readFileSync("./giveaways.json"));
const data = Array.isArray(raw) ? raw : Object.values(raw);
const g = data.find(x => (x.messageId || x.id) == selected);

if (!g)
return interaction.reply({ content: "❌ Giveaway not found", ephemeral: true });

const hostName = g.host?.username || "host";
const cleanPrize = g.prize.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();

const channel = await interaction.guild.channels.create({
name: `${hostName}-${cleanPrize}`.slice(0,25),
parent: CATEGORIES.giveaway,
permissionOverwrites: [
{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
{ id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
{ id: STAFF_ROLE, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
]
});

claimedTickets.set(channel.id, null);

claimedData[key] = { time: Date.now(), channelId: channel.id };
saveClaims(claimedData);

const embed = new EmbedBuilder()
.setColor("#2B2D31")
.setTitle("Skylane Giveaways • Claim Ticket")
.setDescription(`Hello ${interaction.user},

Please be patient and communicate your issue clearly.
<@&${STAFF_ROLE}> will assist you shortly.

━━━━━━━━━━━━━━━━━━━━

Ticket Information
• Type: Giveaway Claim
• ID: ${channel.name}
• Created: <t:${Math.floor(Date.now()/1000)}:f>

━━━━━━━━━━━━━━━━━━━━

Giveaway Details
• Host: <@${g.host?.id || "unknown"}>
• Prize: ${g.prize}
• Link: https://discord.com/channels/${interaction.guild.id}/${g.channelId}/${g.messageId}

━━━━━━━━━━━━━━━━━━━━

Support Team • ETA: 15–30 minutes`);

const buttons = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("claim").setLabel("Claim").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("call").setLabel("Call Staff").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("close").setLabel("Close").setStyle(ButtonStyle.Danger)
);

await channel.send({
content: `${interaction.user} <@&${STAFF_ROLE}>`,
embeds: [embed],
components: [buttons]
});

return interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
}

// CLOSE
if (interaction.customId === "close") {
if (!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({ content: "❌ Staff only", ephemeral: true });

const modal = new ModalBuilder()
.setCustomId("close_modal")
.setTitle("Close Ticket")
.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId("reason")
.setLabel("Reason")
.setStyle(TextInputStyle.Paragraph)
.setRequired(false)
)
);

return interaction.showModal(modal);
}

}

// ===== MODAL =====
if (interaction.isModalSubmit() && interaction.customId === "close_modal") {

await interaction.reply({ content: "Closing ticket...", ephemeral: true });

const channel = interaction.channel;
const claimedBy = claimedTickets.get(channel.id) || null;
const reason = interaction.fields.getTextInputValue("reason") || "No reason provided";

const fileName = `transcript-${channel.name}.html`;

let transcriptBuffer = null;

try {
transcriptBuffer = await createTranscript(channel, {
returnBuffer: true,
fileName
});
} catch (err) {
console.log("Transcript failed:", err);
}

const logChannel = await interaction.guild.channels.fetch(TRANSCRIPT_CHANNEL).catch(() => null);

let transcriptURL = "No transcript available";

if (logChannel) {
const msg = await logChannel.send({
embeds: [
new EmbedBuilder()
.setColor("#2B2D31")
.setTitle("📄 Ticket Closed")
.setDescription(`Transcript: ${transcriptURL}`)
.addFields(
{ name: "Ticket", value: channel.name, inline: true },
{ name: "Closed By", value: `${interaction.user}`, inline: true },
{ name: "Claimed By", value: claimedBy ? `<@${claimedBy}>` : "None", inline: true },
{ name: "Reason", value: reason }
)
.setTimestamp()
],
files: transcriptBuffer ? [{ attachment: transcriptBuffer, name: fileName }] : []
});

if (msg.attachments.first()) {
transcriptURL = msg.attachments.first().url;

const edited = EmbedBuilder.from(msg.embeds[0])
.setDescription(`Transcript: ${transcriptURL}`);

await msg.edit({ embeds: [edited] });
}
}

await interaction.editReply({ content: "✅ Ticket closed!" });

setTimeout(async () => {
try {
if (channel && channel.deletable) {
await channel.delete();
}
} catch (err) {
console.log("Delete error:", err);
}
}, 1500);

}

} catch (err) {

if (err.code === 10062 || err.code === 40060) return;

console.log("Ticket Error:", err);
}

});
};