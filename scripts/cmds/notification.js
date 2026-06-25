const { getStreamsFromAttachment } = global.utils;
const g = require("fca-aryan-nix");
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Stockage temporaire pour notifications et réponses
const notificationMemory = {};
const adminReplies = {};

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "6.1",
    author: "NTKhang x Christus",
    editor: "Camille Uchiha 🌸",
    countDown: 5,
    role: 2,
    category: "owner",
    shortDescription: "🌸 notification kawaii broadcast",
    longDescription: "🌸✨ Envoie message stylé à tous groupes + notifie admins des réponses 🫶",
    guide: { en: `╭─🌸⋅✧₊˚.GUIDE NOTI.˚₊✧⋅🌸─╮\n│\n│ ✨ {pn} <message> → broadcast 💙\n│ 🫶 Supporte images/attachments 🥺\n│ 💙 Admins peuvent répondre via bot\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯` },
    usePrefix: false,
    noPrefix: true
  },

  // Commande principale : envoi de la notification
  onStart: async function({ message, api, event, threadsData, envCommands, commandName, args }) {
    const { delayPerGroup = 300 } = envCommands[commandName] || {};
    if (!args[0]) return message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Entre un message stp 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);

    // GIF kawaii pour notification 🌸
    const gifUrl = "https://i.ibb.co/sJjVsf2T/941ec9120662.gif";
    const cachePath = path.join(__dirname, 'cache', `noti_${Date.now()}.gif`);

    if (!fs.existsSync(path.dirname(cachePath))) {
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    }
    const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(cachePath, Buffer.from(response.data, 'utf-8'));

    const allThreads = (await threadsData.getAll())
     .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

    if (!allThreads.length) return message.reply(`╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Aucun groupe trouvé 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);

    message.reply(`╭─🌸⋅✧₊˚.ENVOI.˚₊✧⋅🌸─╮\n│\n│ 🌸⏳ Envoi en cours aux ${allThreads.length} groupes... 🫶\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);

    let sendSuccess = 0;
    const sendError = [];

    for (const thread of allThreads) {
      let groupName = thread.name || "Groupe inconnu";
      if (!thread.name) {
        try { const info = await api.getThreadInfo(thread.threadID); groupName = info.threadName || groupName; } catch {}
      }

      const notificationBody = `╭─🌸⋅✧₊˚.NOTIFICATION.˚₊✧⋅🌸─╮\n│\n│ 📢🌸 Message broadcast 🫶\n│ 🏷️ Groupe: ${groupName} 💙\n│ ────────────────\n│ 💬 ${args.join(" ")} 🥺\n│\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`.trim();

      const formSend = {
        body: notificationBody,
        attachment: [
          fs.createReadStream(cachePath),
         ...await getStreamsFromAttachment([
           ...event.attachments,
           ...(event.messageReply?.attachments || [])
          ])
        ]
      };

      try {
        const sentMsg = await api.sendMessage(formSend, thread.threadID);
        sendSuccess++;
        notificationMemory[`${thread.threadID}_${sentMsg.messageID}`] = { groupName };
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (err) { sendError.push({ threadID: thread.threadID, groupName, error: err.message }); }
    }

    setTimeout(() => fs.unlinkSync(cachePath), 5000);

    // Bilan
    let bilan = `╭─🌸⋅✧₊˚.BILAN ENVOI.˚₊✧⋅🌸─╮\n│\n│ ✅ Réussi: ${sendSuccess} groupes 💙\n│ ❌ Échec: ${sendError.length} groupes 🥺\n`;
    if (sendError.length) sendError.forEach(err => { bilan += `│ 💔 ${err.groupName}: ${err.error}\n`; });
    bilan += `╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`;
    message.reply(bilan.trim());
  },

  // Détection des réponses à la notification pour call admin
  onMessage: async function({ api, event }) {
    if (!event.messageReply) return;

    const repliedMsgID = event.messageReply.messageID;
    const notificationKey = Object.keys(notificationMemory).find(key => key.endsWith(`_${repliedMsgID}`));
    if (!notificationKey) return;

    const { groupName } = notificationMemory[notificationKey];
    const userName = event.senderName;
    const userID = event.senderID;

    // Prépare le message pour les admins
    const adminMessage = `╭─🌸⋅✧₊˚.RÉPONSE NOTIF.˚₊✧⋅🌸─╮\n│\n│ 👤 Nom: ${userName} 💙\n│ 🆔 ID: ${userID} ✨\n│ 🏷️ Groupe: ${groupName} 🫶\n│ ────────────────\n│ 💬 Message:\n│ ${event.body} 🥺\n│\n│ 💡 Réponds pour répondre via bot~\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`.trim();

    // Liste des admins (role = 2)
    const allThreads = await api.getThreadList(1000, null, ['INBOX']);
    const adminIDs = allThreads
     .filter(t => t.isGroup)
     .flatMap(t => t.members.filter(m => m.role === 2).map(m => m.userID));
    const uniqueAdmins = [...new Set(adminIDs)];

    // Envoie à chaque admin et stocke pour la réponse
    for (const adminID of uniqueAdmins) {
      try {
        const sent = await api.sendMessage(adminMessage, adminID);
        adminReplies[sent.messageID] = {
          originalThreadID: event.threadID,
          userID
        };
      } catch {}
    }
  },

  // Gestion de la réponse d’un admin
  onReply: async function({ api, event }) {
    const replyData = adminReplies[event.messageReply?.messageID];
    if (!replyData) return;

    const { originalThreadID, userID } = replyData;
    try {
      await api.sendMessage(`╭─🌸⋅✧₊˚.ADMIN RÉPONSE.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ Message de l'admin 🫶\n│ ────────────────\n│ 💙 ${event.body} 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`, originalThreadID || userID);
      delete adminReplies[event.messageReply.messageID];
    } catch {}
  }
};
