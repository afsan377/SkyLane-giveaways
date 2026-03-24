const { EmbedBuilder } = require("discord.js");

// Track warnings, greetings, and ping cooldowns
const warnedUsers = new Map();
const greetingsCooldown = new Map();
const pingCooldown = new Map(); // 12h cooldown for ping replies

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    const content = message.content.toLowerCase();
    const author = message.author;

    // ----------------- ALWAYS RESPOND COMMANDS -----------------
    if (content === "!claim") {
      return message.reply({
        content: "🎉 You can claim your reward here: https://discord.gg/UseVsu7vyH",
      });
    }

    if (content === "!support") {
      return message.reply({
        content: "🆘 Need support? Visit this link: https://discord.gg/UseVsu7vyH",
      });
    }

    if (content === "!rules") {
      const rulesEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📜 Server Rules")
        .setDescription(`
Welcome to our server! Please follow these rules strictly.

🔹 **General Rules**
1. Respect everyone – No harassment, bullying, racism, or toxicity.
2. No spamming or flooding chats with messages, emojis, or reactions.
3. No advertising other servers, giveaways, or third-party services without permission.
4. No NSFW, gore, or inappropriate content anywhere in the server.
5. Use the correct channels for the right topics.
6. No alt accounts to bypass bans or participate in giveaways.

🔹 **FakePixel / Carry Rules**
7. No scams, stealing, or trolling during carries – instant blacklist.
8. Follow carrier instructions during runs (Dungeon / Slayer).
9. Do not join if you’re part of any other FakePixel giveaway servers.
10. Payment first policy – all coins must be ready before requesting a carry.
11. Respect the carrier’s time – do not waste or fake queue.

🔹 **Staff & Enforcement**
12. Follow staff directions – arguing with staff decisions may result in a mute/ban.
13. No misuse of tickets, pings, or staff roles.
14. If you see rule-breaking, report it instead of starting drama.
15. Breaking rules = warn → mute → kick → ban depending on severity.

⚠️ Staff decisions are final. Any attempt to bypass rules or exploit loopholes will result in instant punishment.

✨ By staying in this server, you agree to follow these rules.
        `);
      return message.reply({ embeds: [rulesEmbed] });
    }

    // ----------------- Ping bot exactly -----------------
    const botId = "<@768760388459692043>";
    if (content === botId) {
      const lastPing = pingCooldown.get(author.id) || 0;
      if (Date.now() - lastPing > 12 * 60 * 60 * 1000) {
        pingCooldown.set(author.id, Date.now());
        return message.reply(
          `😳 Hey ${author}, why are you pinging him? you have done a great mistake. do you even know who is he? he is a **Afsank/kratos**. you shouldn't have pinged him. you could have pinged me, Maybe I can help, or wait a bit — they will come.`
        );
      }
    }

    // ----------------- Skylane -----------------
    const afsankId = "<@1481313048189866037>";
    const skylaneKeywords = ["skylane giveaways", "skylane giveaway", afsankId];

    if (skylaneKeywords.some(k => content.includes(k))) {
      return message.reply({
        content: `👋 Hey ${author}, I noticed you mentioned me / Skylane. If you need help or info, join the support server:
https://discord.gg/UseVsu7vyH

⚡ Pro tip: Always check pinned messages and !rules before asking.`
      });
    }

    // ----------------- Help -----------------
    const helpTriggers = ["help me", "please help me", "i need help"];
    if (helpTriggers.some(h => content.includes(h))) {
      return message.reply({
        content: `👋 Hey ${author}, if you need any kind of help, join the support server:
https://discord.gg/UseVsu7vyH`
      });
    }

    // ----------------- Talking to bot -----------------
    const isTalkingToBot =
      message.mentions.has(client.user) ||
      (message.reference && message.reference.messageId);

    // ----------------- Thanks -----------------
    const thanksWords = ["thanks", "thank you", "thx"];
    if (isTalkingToBot && thanksWords.some(t => content.includes(t))) {
      return message.reply(`😊 You're welcome, ${author}! Always here to help.`);
    }

    // ----------------- Greetings -----------------
    const greetings = ["hi", "hello", "hey", "yo"];
    if (isTalkingToBot && greetings.some(g => content.startsWith(g))) {
      const lastGreet = greetingsCooldown.get(author.id) || 0;
      if (Date.now() - lastGreet > 24 * 60 * 60 * 1000) {
        greetingsCooldown.set(author.id, Date.now());
        return message.reply(`👋 Hey ${author}, nice to see you!`);
      }
    }

    // ----------------- BAD WORDS (FIXED) -----------------
    const badWords = [
      "idiot","stupid","noob","dumb","loser","suck","trash","fool","moron","dummy",
      "garbage","retard","clown","pathetic","worthless","weak","brainless",
      "useless","jerk","loserbot","failbot",
      "shit","fuck","bitch","asshole","bastard","dick","crap",
      "shut up","kys","kill yourself","mf","motherfucker",
      "nigga","retarded","dumbass","shitbot","fuckbot","botshit"
    ];

    const words = content.split(/\s+/);

    if (badWords.some(word => words.includes(word))) {
      warnedUsers.set(author.id, true);
      return message.reply(`⚠️ Watch your language, ${author}! Keep it friendly.`);
    }

    // Extra detection (kept)
    if (content.includes("wtf")) {
      warnedUsers.set(author.id, true);
      return message.reply(`⚠️ Watch your language, ${author}! Keep it friendly.`);
    }

    // ----------------- Sorry -----------------
    const sorryWords = ["sorry", "sry", "my bad", "oops"];
    if (warnedUsers.has(author.id) && sorryWords.some(s => content.includes(s))) {
      warnedUsers.delete(author.id);
      return message.reply(`😊 It's all good, ${author}! Thanks for apologizing.`);
    }

    // ----------------- Savage -----------------
    const savageTriggers = [
      "you suck","hate you","useless bot","stupid bot","worst bot","bot is dumb",
      "bot is trash","garbage bot","bot sucks","bot useless","bot stupid"
    ];

    if (isTalkingToBot && savageTriggers.some(s => content.includes(s))) {
      const savageReplies = [
        "😏 Oh really? Try harder.",
        "😂 That was weak.",
        "😎 I expected better.",
        "🤡 Nice attempt."
      ];
      return message.reply(savageReplies[Math.floor(Math.random() * savageReplies.length)]);
    }

    // ----------------- Joke -----------------
    if (isTalkingToBot && content.includes("joke")) {
      const jokes = [
        "😂 Why don’t coders go outside? Too many bugs.",
        "🤣 I tried debugging life… still errors.",
        "😆 Why did the bot win? Better logic."
      ];
      return message.reply(jokes[Math.floor(Math.random() * jokes.length)]);
    }

    // ----------------- Conversation -----------------
    if (isTalkingToBot) {
      if (content.includes("how are you")) {
        return message.reply(`😎 I'm doing great ${author}.`);
      }

      if (content.includes("what are you doing")) {
        return message.reply(`🤖 Just managing things here.`);
      }

      if (content.includes("who are you")) {
        return message.reply(`👀 I'm the server bot.`);
      }

      if (content === "ok" || content === "k") {
        return message.reply("👍");
      }
    }

  });
};