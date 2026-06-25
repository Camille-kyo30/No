module.exports = {
    config: {
        name: "king",
        aliases: ["admin", "promote", "crown"],
        version: "1.1",
        author: "Messie Osango",
        editor: "Camille Uchiha 🌸",
        countDown: 5,
        role: 1,
        shortDescription: {
            en: "👑 Couronne un Hunter comme admin kawaii ✨"
        },
        longDescription: {
            en: "Promouvoit un utilisateur en admin du groupe~ Deviens roi/reine du groupe 👑💙"
        },
        category: "admin",
        guide: {
            en: `🌸 GUIDE MINI KING 👑
king @tag → Couronne la personne tag
king <uid> → Couronne par ID
Reply + king → Couronne celui qui a envoyé le msg 🫶`
        }
    },

    onStart: async function ({ event, api, args, usersData, message }) {
        const threadID = event.threadID;
        const uid = event.type === "message_reply"
           ? event.messageReply.senderID
            : Object.keys(event.mentions)[0] || args[0];

        // Vérif bot admin
        if (!global.GoatBot.config.adminBot.includes(event.senderID)) {
            return message.reply("🌸🔒 Aïe~ Seuls les boss du bot peuvent couronner des rois 🥺");
        }

        if (!uid || isNaN(uid)) {
            return message.reply("🌸 Aïe~ Tag un Hunter ou mets un UID valide stp 🥺\nEx: king @Hunter ou king 1000...");
        }

        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const currentAdmins = threadInfo.adminIDs.map(item => item.id);
            const userName = await usersData.getName(uid) || "Hunter Mystère";

            if (currentAdmins.includes(uid)) {
                return message.reply(`🌸👑 Aïe~ ${userName} est déjà roi/reine du groupe~ 👑✨`);
            }

            await api.changeAdminStatus(threadID, uid, true);

            message.reply(
                `🌸✨ 𝑪𝑶𝑼𝑹𝑶𝑵𝑬𝑴𝑬𝑵𝑻 𝑲𝑨𝑾𝑨𝑰 ✨🌸\n\n` +
                `👑 ${userName} a été couronné admin du groupe!\n` +
                `🆔 UID: ${uid}\n\n` +
                `𝑴𝒂𝒊𝒏𝒕𝒆𝒏𝒂𝒏𝒕 𝒊𝒍/𝒆𝒍𝒆 𝒑𝒆𝒖𝒕 𝒈𝒆́𝒓𝒆𝒓 𝒍𝒆 𝒓𝒐𝒚𝒂𝒖𝒎𝒆~ 💙\n` +
                `𝑭𝒆́𝒍𝒊𝒄𝒊𝒕𝒂𝒕𝒊𝒐𝒏𝒔 𝑴𝒂𝒋𝒆𝒔𝒕𝒆́~ 🫶👑`
            );
        } catch (err) {
            console.error(err);
            message.reply("🌸💔 Aïe~ Impossible de couronner ce Hunter~ Vérifie mes perms admin stp 🥺");
        }
    }
};
