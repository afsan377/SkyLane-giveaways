const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require("discord.js");

const STAFF_ROLE = "1418434416660713593"; // Staff role ID
const TICKET_CATEGORY = "1420415184865984684"; // Ticket category ID

// In-memory storage
const staffPoints = {};
const usedPanelChannels = new Set();
const claimedTickets = new Set();

module.exports = (client) => {
  // Register /panel2 command on startup
  client.on("ready", async () => {
    const data = {
      name: "panel2",
      description: "Send sponsorship ticket panel (one per channel)"
    };

    const guild = client.guilds.cache.first();
    if (guild) {
      await guild.commands.create(data);
      console.log("✅ /panel2 registered");
    }
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      // ===== Panel Command =====
      if (interaction.isCommand() && interaction.commandName === "panel2") {
        if (usedPanelChannels.has(interaction.channelId)) {
          return interaction.reply({ content: "❌ Panel already sent in this channel.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setColor("#2B2D31")
          .setTitle("Skylane Giveaways • Sponsorship Panel")
          .setDescription(
`Welcome to **Skylane Giveaways Sponsorships**!  

Click **Open a Ticket** below to request a sponsored giveaway.  
Our staff will assist you promptly.  
Avoid tagging staff directly.`
          )
          .setFooter({ text: "Skylane Giveaways • Supporting our community together" });

        const menu = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("sponsor_panel")
            .setPlaceholder("Select an option...")
            .addOptions([
              { label: "Open a Ticket", description: "Request a sponsored giveaway", value: "sponsor_ticket" }
            ])
        );

        usedPanelChannels.add(interaction.channelId);
        return interaction.reply({ embeds: [embed], components: [menu], ephemeral: false });
      }

      // ===== Dropdown Menu =====
      if (interaction.isStringSelectMenu() && interaction.customId === "sponsor_panel") {
        if (interaction.values[0] === "sponsor_ticket") {
          const modal = new ModalBuilder()
            .setCustomId("sponsor_ticket_modal")
            .setTitle("Sponsor Giveaway Ticket");

          const ignInput = new TextInputBuilder()
            .setCustomId("ign")
            .setLabel("Your IGN / Username")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const coinsInput = new TextInputBuilder()
            .setCustomId("coins")
            .setLabel("Reward / Coins")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const durationInput = new TextInputBuilder()
            .setCustomId("duration")
            .setLabel("Giveaway Duration")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const winnersInput = new TextInputBuilder()
            .setCustomId("winners")
            .setLabel("Number of Giveaway Winners")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const msgInput = new TextInputBuilder()
            .setCustomId("msg")
            .setLabel("Additional Notes")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

          modal.addComponents(
            { type: 1, components: [ignInput] },
            { type: 1, components: [coinsInput] },
            { type: 1, components: [durationInput] },
            { type: 1, components: [winnersInput] },
            { type: 1, components: [msgInput] }
          );

          return interaction.showModal(modal);
        }
      }

      // ===== Modal Submission =====
      if (interaction.isModalSubmit() && interaction.customId === "sponsor_ticket_modal") {
        const ign = interaction.fields.getTextInputValue("ign");
        const coins = interaction.fields.getTextInputValue("coins");
        const duration = interaction.fields.getTextInputValue("duration");
        const winners = interaction.fields.getTextInputValue("winners");
        const msg = interaction.fields.getTextInputValue("msg") || "No note provided";

        const ticketNumber = Math.floor(Math.random() * 9000) + 1000;
        const ticketName = `${interaction.user.username}-${ticketNumber}`;

        const ticketChannel = await interaction.guild.channels.create({
          name: ticketName,
          type: ChannelType.GuildText,
          parent: TICKET_CATEGORY,
          permissionOverwrites: [
            { id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: STAFF_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
          ]
        });

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim Ticket").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("close_ticket").setLabel("Close Ticket").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("call_staff").setLabel("Call Staff").setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
          .setColor("#2B2D31")
          .setTitle("🎟️ Sponsor Giveaway Ticket")
          .setDescription(
`Hello <@${interaction.user.id}>!
Please wait for staff assistance.
<@&${STAFF_ROLE}> will assist you as soon as possible.`
          )
          .addFields(
            { name: "Ticket Information", value: `- Type: Sponsor Giveaway\n- ID: ${ticketName}\n- Created: <t:${Math.floor(Date.now() / 1000)}:F>` },
            { name: "Sponsor Request Details", value: `- IGN: ${ign}\n- Reward: ${coins}\n- Duration: ${duration}\n- Winners: ${winners}\n- Notes: ${msg}` }
          );

        await ticketChannel.send({ content: `<@${interaction.user.id}> <@&${STAFF_ROLE}>`, embeds: [embed], components: [buttons] });
        return interaction.reply({ content: `✅ Your ticket has been created: ${ticketChannel}`, ephemeral: true });
      }

      // ===== Buttons =====
      if (interaction.isButton()) {
        const ticketChannel = interaction.channel;
        const lastMsg = (await ticketChannel.messages.fetch({ limit: 1 })).first();

        // Claim Ticket
        if (interaction.customId === "claim_ticket") {
          if (!interaction.member.roles.cache.has(STAFF_ROLE))
            return interaction.reply({ content: "❌ Only staff can claim tickets.", ephemeral: true });

          if (claimedTickets.has(ticketChannel.id))
            return interaction.reply({ content: "❌ This ticket has already been claimed.", ephemeral: true });

          claimedTickets.add(ticketChannel.id); // mark ticket as claimed

          const embed = EmbedBuilder.from(lastMsg.embeds[0])
            .setFooter({ text: `✅ Claimed by ${interaction.user.tag}` });

          staffPoints[interaction.user.id] = (staffPoints[interaction.user.id] || 0) + 1;

          await interaction.update({ embeds: [embed], components: lastMsg.components });
        }

        // Close Ticket
        if (interaction.customId === "close_ticket") {
          if (!interaction.member.roles.cache.has(STAFF_ROLE))
            return interaction.reply({ content: "❌ Only staff can close tickets.", ephemeral: true });

          await interaction.update({ content: "❌ Ticket closed.", embeds: [], components: [] });
          setTimeout(() => ticketChannel.delete().catch(() => {}), 2000);
        }

        // Call Staff
        if (interaction.customId === "call_staff") {
          await interaction.reply({ content: "📢 Staff has been notified!", ephemeral: true });
          ticketChannel.send(`<@&${STAFF_ROLE}> - ${interaction.user.tag} is requesting faster assistance!`);
        }
      }
    } catch (err) {
      console.log("Interaction Error:", err);
    }
  });
};
