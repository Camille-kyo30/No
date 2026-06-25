const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
    config: {
        name: "antiout",
        aliases: ["antileave", "ao"],
        version: "1.0",
        author: "Chitron Bhattacharjee",
        editor: "Camille Uchiha 🌸",
        countDown: 5,
        role: 1,
        shortDescription: {
            en: "🌸 Protecteur mini anti-fuite de groupe"
        },
        longDescription: {
            en: "Enable/disable mode mignon qui remet les Hunter qui quittent le groupe 🫶"
        },
        category: "admin",
        guide: {
            en: "{pn} [on|off] → Active/désactive la protection mini"
        }
    },

    langs: {
        en: {
            turnedOn: "🛡️✨ MODE MINI ACTIVÉ ✨🛡️\nLe groupe est protégé~ Personne part sans dire au revoir 🦆💕",
            turnedOff: "🌸 MODE MINI DÉSACTIVÉ 🌸\nLes Hunter peuvent partir librement maintenant~",
            missingPermission: "❌ Aïe boss! J’ai pas pu ramener %1 🥺\nIl m’a bloqué ou Messenger désactivé...",
            addedBack: "⚠️ Hey %1! Tu reviens ici direct~ ✨\nCe groupe appartient à mon boss Camille Uchiha! 🫡\nFaut une autorisation admin pour partir mdr 😤💙"
        }
    },

    onStart: async function ({ args, message, event, threadsData, getLang }) {
        if (args[0] === "on") {
            await threadsData.set(event.threadID, true, "data.antiout");
            message.reply(getLang("turnedOn"));
        }
        else if (args[0] === "off") {
            await threadsData.set(event.threadID, false, "data.antiout");
            message.reply(getLang("turnedOff"));
        }
        else {
            message.reply("🌸 Usage: antiout on/off → Active/désactive la protection mignonne");
        }
    },

    onEvent: async function ({ event, api, threadsData, usersData, getLang }) {
        if (event.logMessageType!== "log:unsubscribe")
            return;

        const antiout = await threadsData.get(event.threadID, "data.antiout");
        if (!antiout)
            return;

        if (event.logMessageData.leftParticipantFbId === api.getCurrentUserID())
            return;

        const name = await usersData.getName(event.logMessageData.leftParticipantFbId);

        try {
            await api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID);
            api.sendMessage(getLang("addedBack", name), event.threadID);
        }
        catch (error) {
            api.sendMessage(getLang("missingPermission", name), event.threadID);
        }
    }
};
