module.exports = {
  config: {
    name: "join",
    version: "3.1",
    author: "Camille-Dev 🩵",
    countDown: 5,
    role: 2,
    shortDescription: "S'infiltrer dans un quartier (groupe) où le bot est présent",
    longDescription: "Affiche la liste des quartiers disponibles. Réponds avec le numéro pour que Camille t'ajoute.",
    category: "propriétaire",
    guide: { fr: "{p}{n} [page|next|prev]" },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const groupList = await api.getThreadList(200, null, ["INBOX"]);
      const filteredList = groupList.filter(g => g.isGroup && g.isSubscribed);

      if (!filteredList.length) return api.sendMessage("❌ Aucun quartier trouvé. Le bot est au chômage.", event.threadID);

      const pageSize = 15;
      const totalPages = Math.ceil(filteredList.length / pageSize);
      if (!global.joinPage) global.joinPage = {};
      const currentThread = event.threadID;

      let page = 1;
      if (args[0]) {
        const input = args[0].toLowerCase();
        if (input === "next") page = (global.joinPage[currentThread] || 1) + 1;
        else if (input === "prev") page = (global.joinPage[currentThread] || 1) - 1;
        else page = parseInt(input) || 1;
      }

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      global.joinPage[currentThread] = page;

      const startIndex = (page - 1) * pageSize;
      const currentGroups = filteredList.slice(startIndex, startIndex + pageSize);

      const formatted = currentGroups.map((g, i) =>
        `┃ ${startIndex + i + 1}. 『 ${g.threadName || "Quartier sans nom"} 』\n┃ 👥 ${g.participantIDs.length} mogos\n┃ 🆔 ${g.threadID}\n┃`
      );

      const message = [
        "┏━━━━━ 🤝 𝗜𝗡𝗙𝗜𝗟𝗧𝗥𝗔𝗧𝗜𝗢𝗡 ━━━━━┓",
        "  𝗖𝗔𝗠𝗜𝗟𝗟𝗘 𝗧'𝗢𝗨𝗩𝗥𝗘 𝗟𝗔 𝗣𝗢𝗥𝗧𝗘 🇨🇮",
        "┗━━━━━━━━━━━━━━━━━━━━━━┛",
        formatted.join("\n"),
        "──────────────────────",
        `📄 Page ${page}/${totalPages} | Total: ${filteredList.length} quartiers`,
        "📌 Note : Si le quartier est gâté (250+), on n'entre pas.",
        "──────────────────────",
        "",
        "👉 Réponds avec le numéro du quartier pour que je t'ajoute !"
      ].join("\n");

      const sentMessage = await api.sendMessage(message, event.threadID);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "join",
        messageID: sentMessage.messageID,
        author: event.senderID,
        list: filteredList,
        page,
        pageSize
      });

    } catch (e) {
      api.sendMessage("⚠️ Camille a un drap pour fouiller les quartiers.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, list, page, pageSize } = Reply;
    if (event.senderID !== author) return;

    const groupIndex = parseInt(args[0], 10);
    if (isNaN(groupIndex) || groupIndex <= 0) {
      return api.sendMessage("⚠️ Ahiii ! Donne un vrai chiffre mogo.", event.threadID, event.messageID);
    }

    const startIndex = (page - 1) * pageSize;
    const currentGroups = list.slice(startIndex, startIndex + pageSize);

    if (groupIndex > currentGroups.length) {
      return api.sendMessage("⚠️ Ce numéro n'est pas sur cette page, ne bluffe pas.", event.threadID, event.messageID);
    }

    try {
      const selected = currentGroups[groupIndex - 1];
      const groupID = selected.threadID;
      const members = await api.getThreadInfo(groupID);

      if (members.participantIDs.includes(event.senderID)) {
        return api.sendMessage(`⚠️ Tu es déjà dans le quartier 『${selected.threadName}』 !`, event.threadID, event.messageID);
      }
      if (members.participantIDs.length >= 250) {
        return api.sendMessage(`🚫 Le quartier 『${selected.threadName}』 est déjà plein, on ne peut plus se mélanger.`, event.threadID, event.messageID);
      }

      await api.addUserToGroup(event.senderID, groupID);
      api.sendMessage(`✅ C'est fait ! Camille t'a balancé dans 『${selected.threadName}』. Fais ton show ! 🕺`, event.threadID, event.messageID);

    } catch (e) {
      api.sendMessage("❌ Le videur a refusé ton entrée. (Erreur d'ajout)", event.threadID, event.messageID);
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  },
};
