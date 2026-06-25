const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
    config: {
        name: "Out",
        aliases: ["l", "leave"],
        version: "1.0",
        author: "Chitron Bhattacharjee",
        editor: "Camille Uchiha 🌸",
        countDown: 5,
        role: 2,
        shortDescription: "Bot quitte le groupe avec style",
        longDescription: "Commande mignonne pour faire partir le bot du groupe",
        category: "admin",
        guide: {
            vi: "{pn} [tid,blank]",
            en: "{pn} [tid,blank] ou réponds à un msg du groupe"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        var id;
        if (!args.join(" ")) {
            id = event.threadID;
        } else {
            id = parseInt(args.join(" "));
        }

        const byeMsg = 
`🌸✨ 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐃É𝐂𝐎𝐍𝐄𝐂𝐓 ✨🌸

𝐎𝐊 𝐁𝐘𝐄~ 𝐋𝐄𝐅𝐓 𝐆𝐑𝐎𝐔𝐏 🦆💨
Merci pour tout les Hunter~ 🫶

Creator: Chitron Bhattacharjee
Edited by: Camille Uchiha 💙`;

        return api.sendMessage(byeMsg, id, () => api.removeUserFromGroup(api.getCurrentUserID(), id));
    }
};
