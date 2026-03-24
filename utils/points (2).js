const fs = require("fs");
const path = "./data/points.json";

function getPoints() {
 if (!fs.existsSync(path)) return {};
 return JSON.parse(fs.readFileSync(path));
}

function savePoints(data) {
 fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function addPoints(userId, amount) {
 const data = getPoints();

 if (!data[userId]) data[userId] = 0;
 data[userId] += amount;

 savePoints(data);
 return data[userId];
}

function removePoints(userId, amount) {
 const data = getPoints();

 if (!data[userId]) data[userId] = 0;
 data[userId] -= amount;

 if (data[userId] < 0) data[userId] = 0;

 savePoints(data);
 return data[userId];
}

module.exports = { getPoints, addPoints, removePoints };