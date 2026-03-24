const fs = require("fs");
const path = "./data/messageCounts.json";

let messageCounts = {};

// Load existing data
if (fs.existsSync(path)) {
  messageCounts = JSON.parse(fs.readFileSync(path, "utf8"));
}

function saveData() {
  fs.writeFileSync(path, JSON.stringify(messageCounts, null, 2));
}

function addMessages(guildId, userId, amount) {
  if (!messageCounts[guildId]) messageCounts[guildId] = {};
  if (!messageCounts[guildId][userId]) messageCounts[guildId][userId] = 0;
  messageCounts[guildId][userId] += amount;
  saveData();
}

function removeMessages(guildId, userId, amount) {
  if (!messageCounts[guildId] || !messageCounts[guildId][userId]) return;
  messageCounts[guildId][userId] -= amount;
  if (messageCounts[guildId][userId] < 0) messageCounts[guildId][userId] = 0;
  saveData();
}

function resetMessages(guildId, userId) {
  if (!messageCounts[guildId]) return;
  if (userId === "all") {
    messageCounts[guildId] = {};
  } else {
    delete messageCounts[guildId][userId];
  }
  saveData();
}

function getLeaderboard(guildId) {
  const guildCounts = messageCounts[guildId] || {};
  return Object.entries(guildCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, count }));
}

module.exports = {
  messageCounts,
  addMessages,
  removeMessages,
  resetMessages,
  getLeaderboard,
};