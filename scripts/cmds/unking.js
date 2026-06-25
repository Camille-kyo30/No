module.exports = {
    config: {
        name: "unking",
        aliases: ["unadmin", "demote", "decrown"],
        version: "1.0",
        author: "Camille Uchiha 🌸",
        countDown: 5,
        role: 0,
        shortDescription: {
            fr: "👑 Retire le statut admin kawaii ✨"
        },
        longDescription: {
            fr: "Retire le statut d'administrateur à tous les admins du groupe sauf le bot~ Retour au peuple 💙"
        },
        category: "admin",
        guide: {
            fr: `🌸 GUIDE MINI UNKING 👑
unking → Destitue tous les admins sauf le bot 🫡
unking <uid> → Retire admin à un Hunter spécifique 🥺
Ex: unking 1000123456789`
        }
    },

    onStart: async function({ api, event, args, message }) {
        const botAdmins = global.GoatBot.config.adminBot;

        try {
            // Vérif bot admin
            if (!botAdmins.includes(event.senderID)) {
                return message.reply("🌸🔒 Aïe~ Seuls les boss du bot peuvent destituer des rois 🥺");
            }

            // Si UID donné → retire admin à cette personne
            if (args[0] && /^\d+$/.test(args[0])) {
                const targetUID = args[0];
                try {
                    const threadInfo = await api.getThreadInfo(event.threadID);
                    const botID = api.getCurrentUserID();
                    const botIsAdmin = threadInfo.adminIDs.find(admin => admin.id === botID);

                    if (!botIsAdmin) {
                        return message.reply("🌸💔 Aïe~ Le bot doit être admin pour destituer quelqu'un 🥺");
                    }

                    await api.changeAdminStatus(event.threadID, targetUID, false);
                    return message.reply(`🌸👑 Démission effectuée!\n👤 UID: ${targetUID}\nRetour au peuple~ 💙`);
                } catch (err) {
                    console.error(err);
                    return message.reply("🌸💔 Erreur lors du retrait admin pour: " + targetUID);
                }
            } else {
                // Sinon → retire admin à tous sauf bot
                if (!event.isGroup) {
                    return message.reply("🌸 Aïe~ Cette commande marche que dans les groupes 🥺");
                }

                const threadInfo = await api.getThreadInfo(event.threadID);
                const botID = api.getCurrentUserID();
                const botIsAdmin = threadInfo.adminIDs.find(admin => admin.id === botID);

                if (!botIsAdmin) {
                    return message.reply("🌸🔒 Aïe~ Le bot doit être admin pour destituer les autres 🥺");
                }

                const allAdmins = threadInfo.adminIDs.map(admin => admin.id);
                const adminsToRemove = allAdmins.filter(id => id!== botID);

                if (adminsToRemove.length === 0) {
                    return message.reply("🌸👑 Y'a aucun admin à destituer~ Tu es seul roi ici~ ✨");
                }

                let successCount = 0;
                let failCount = 0;

                for (const adminID of adminsToRemove) {
                    try {
                        await api.changeAdminStatus(event.threadID, adminID, false);
                        successCount++;
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    } catch (err) {
                        console.error("Erreur destitution " + adminID + ":", err);
                        failCount++;
                    }
                }

                let replyMsg = `🌸✨ 𝑫𝑬𝑺𝑻𝑰𝑻𝑼𝑻𝑰𝑶𝑵 𝑲𝑨𝑾𝑨𝑰 ✨🌸\n\n` +
                    `✅ ${successCount} admin(s) destitué(s) avec succès~ 👑💙`;

                if (failCount > 0) {
                    replyMsg += `\n🌸 Échec pour ${failCount} admin(s)~ 🥺`;
                }

                return message.reply(replyMsg);
            }
        } catch (error) {
            console.error(error);
            return message.reply("🌸💔 Aïe~ Erreur pendant la destitution~ Vérifie mes perms admin stp 🥺");
        }
    }
};
