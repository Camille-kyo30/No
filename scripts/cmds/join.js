module.exports = {
  config: {
    name: "join",
    version: "3.2",
    author: "Christus",
    editor: "Camille Uchiha 🌸",
    countDown: 5,
    role: 2,
    dev: true,
    shortDescription: "🌸 rejoindre groupe kawaii",
    longDescription: "🌸✨ Liste paginée des groupes, réponds avec un numéro pour rejoindre 🫶",
    category: "owner",
    guide: { en: `╭─🌸⋅✧₊˚.GUIDE JOIN.˚₊✧⋅🌸─╮\n│\n│ ✨ {p}{n} → liste groupes 💙\n│ ✨ {p}{n} next → page suivante 🫶\n│ ✨ {p}{n} prev → page précédente 🥺\n│ ✨ {p}{n} 1/3 → aller page 1\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯` },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const groupList = await api.getThreadList(200, null, ["INBOX"]);
      const filteredList = groupList.filter(g => g.isGroup && g.isSubscribed);

      if (!filteredList.length) return api.sendMessage(`╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Aucun groupe trouvé 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, event.threadID);

      const pageSize = 15;
      const totalPages = Math.ceil(filteredList.length / pageSize);
      if (!global.joinPage) global.joinPage = {};
      const currentThread = event.threadID;

      let page = 1;
      if (args[0]) {
        const input = args[0].toLowerCase();
        if (input === "next") page = (global.joinPage[currentThread] || 1) + 1;
        else if (input === "prev") page = (global.joinPage[currentThread] || 1) - 1;
        else if (input.includes("/")) page = parseInt(input.split("/")[0]) || 1;
        else page = parseInt(input) || 1;
      }

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      global.joinPage[currentThread] = page;

      const startIndex = (page - 1) * pageSize;
      const currentGroups = filteredList.slice(startIndex, startIndex + pageSize);

      const formatted = currentGroups.map((g, i) =>
        `│ 🌸 No. ${startIndex + i + 1} 🥺\n│ ✨ 『${g.threadName || "Groupe sans nom"}』💙\n│ 👥 ${g.participantIDs.length} membres 🫶\n│ 🆔 ${g.threadID} ✨\n│ ────────────────`
      );

      const message = [
        `╭─🌸⋅✧₊˚.REJOINDRE GROUPE.˚₊✧⋅🌸─╮`,
        `│`,
        `│ 🌸✨ Liste des groupes bot 🫶`,
        `│`,
        formatted.join("\n│\n"),
        `│`,
        `│ 📄 Page ${page}/${totalPages} | Total: ${filteredList.length} groupes 💙`,
        `│ 📌 Max membres: 250 ✨`,
        `│`,
        `│ 👉 Réponds avec le numéro~ 🥺`,
        `╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
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
      console.error(e);
      api.sendMessage(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Erreur récupération 🥺\n│ 📝 Réessaie stp~ 💙\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, list, page, pageSize } = Reply;
    if (event.senderID!== author) return;

    const groupIndex = parseInt(args[0], 10);
    if (isNaN(groupIndex) || groupIndex <= 0) {
      return api.sendMessage(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Numéro invalide 🥺\n│ 💙 Réponds 1-${pageSize} stp\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, event.threadID, event.messageID);
    }

    const startIndex = (page - 1) * pageSize;
    const currentGroups = list.slice(startIndex, startIndex + pageSize);

    if (groupIndex > currentGroups.length) {
      return api.sendMessage(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Hors de portée 🥺\n│ 💙 Choisis 1-${currentGroups.length}\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, event.threadID, event.messageID);
    }

    try {
      const selected = currentGroups[groupIndex - 1];
      const groupID = selected.threadID;
      const members = await api.getThreadInfo(groupID);

      if (members.participantIDs.includes(event.senderID)) {
        return api.sendMessage(`╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ Tu es déjà dans 🫶\n│ 『${selected.threadName}』💙\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, event.threadID, event.messageID);
      }
      if (members.participantIDs.length >= 250) {
        return api.sendMessage(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Groupe complet 🥺\n│ 『${selected.threadName}』💔\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, event.threadID, event.messageID);
      }

      await api.addUserToGroup(event.senderID, groupID);
      api.sendMessage(`╭─🌸⋅✧₊˚.SUCCÈS.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ Ajouté avec succès~ 🫶\n│ 💙 『${selected.threadName}』✨\n│ 🥺 Bienvenue dans le groupe~\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, event.threadID, event.messageID);

    } catch (e) {
      console.error(e);
      api.sendMessage(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Échec ajout 🥺\n│ 📝 Réessaie plus tard~ 💙\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, event.threadID, event.messageID);
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  },
};
