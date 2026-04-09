const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
    config: {
        name: "callad",
        version: "1.7",
        author: "Camille 🇨🇮",
        countDown: 5,
        role: 0,
        description: {
            fr: "📨 Signaler un drap ou envoyer un message aux Vieux Pères (Admins)",
            en: "📨 Send reports or bugs directly to bot admins"
        },
        category: "contacts admin",
        guide: {
            fr: "📌 Usage : {pn} <ton message pimenté>",
            en: "📌 Usage: {pn} <your message>"
        }
    },

    langs: {
        fr: {
            missingMessage: "❌ Ahiii ! Tu m'appelles pour ne rien dire ? Écris ton message d'abord ! 🙄",
            sendByGroup: "\n📍 Venu du quartier : %1\n🆔 ID du Groupe : %2",
            sendByUser: "\n📍 Message en privé (DM)",
            content: "\n\n💬 CE QU'IL DIT :\n────────────────────────────\n%1\n────────────────────────────\n💡 Vieux Père, réponds ici pour lui donner les nouvelles !",
            success: "✅ C'est gâté ! Ton message a été livré à %1 admin(s) :\n%2\n\nFaut patienter, le mogo va te répondre. 🇨🇮",
            failed: "❌ Y'a eu un petit dra lors de l'envoi à %1 admin(s)\n%2\n📌 Les fétiches du serveur sont forts aujourd'hui...",
            reply: "📍 RÉPONSE DU VIEUX PÈRE %1 🇨🇮 :\n────────────────────────────\n%2\n────────────────────────────\n💡 Réponds ici pour continuer la palabre avec lui.",
            replySuccess: "✅ C'est envoyé ! L'admin va lire ça maintenant.",
            feedback: "📝 FEEDBACK DU PETIT %1 :\n🆔 User ID : %2%3\n\n💬 SON DOSSIER :\n────────────────────────────\n%4\n────────────────────────────\n💡 Réponds pour lui fermer la bouche ou l'aider !",
            replyUserSuccess: "✅ C'est bon, le petit a reçu ta réponse. 🇨🇮🔥",
            noAdmin: "⚠️ Actuellement, aucun chef n'est au quartier (aucun admin)."
        }
    },

    onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
        const { config } = global.GoatBot;

        if (!args[0]) return message.reply(getLang("missingMessage"));

        const { senderID, threadID, isGroup } = event;
        if (config.adminBot.length === 0) return message.reply(getLang("noAdmin"));

        const senderName = await usersData.getName(senderID);

        const msgHeader = "╔══════ 🇨🇮 𝗦.𝗢.𝗦 𝗔𝗗𝗠𝗜𝗡 🇨🇮 ══════╗"
            + `\n👤 𝗠𝗢𝗚𝗢 : ${senderName}`
            + `\n🆔 𝗜𝗗 : ${senderID}`
            + (isGroup ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));

        const formMessage = {
            body: msgHeader + getLang("content", args.join(" ")),
            mentions: [{
                id: senderID,
                tag: senderName
            }],
            attachment: await getStreamsFromAttachment(
                [...event.attachments, ...(event.messageReply?.attachments || [])]
                    .filter(item => mediaTypes.includes(item.type))
            )
        };

        const successIDs = [];
        const failedIDs = [];
        const adminNames = await Promise.all(config.adminBot.map(async item => ({
            id: item,
            name: await usersData.getName(item)
        })));

        for (const uid of config.adminBot) {
            try {
                const messageSend = await api.sendMessage(formMessage, uid);
                successIDs.push(uid);
                global.GoatBot.onReply.set(messageSend.messageID, {
                    commandName,
                    messageID: messageSend.messageID,
                    threadID,
                    messageIDSender: event.messageID,
                    type: "userCallAdmin"
                });
            } catch (err) {
                failedIDs.push({ adminID: uid, error: err });
            }
        }

        let resultMsg = "╚════════════════════════╝\n";
        if (successIDs.length > 0) {
            resultMsg += getLang("success", successIDs.length,
                adminNames.filter(item => successIDs.includes(item.id))
                    .map(item => ` ✨ <@${item.id}> (${item.name})`).join("\n")
            );
        }
        if (failedIDs.length > 0) {
            resultMsg += "\n" + getLang("failed", failedIDs.length,
                failedIDs.map(item => ` ❌ <@${item.adminID}> (${adminNames.find(a => a.id === item.adminID)?.name || item.adminID})`).join("\n")
            );
            log.err("CALL ADMIN", failedIDs);
        }

        return message.reply({
            body: resultMsg,
            mentions: adminNames.map(item => ({ id: item.id, tag: item.name }))
        });
    },

    onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
        const { type, threadID, messageIDSender } = Reply;
        const senderName = await usersData.getName(event.senderID);
        const { isGroup } = event;

        switch (type) {
            case "userCallAdmin": {
                const formMessage = {
                    body: getLang("reply", senderName, args.join(" ")),
                    mentions: [{ id: event.senderID, tag: senderName }],
                    attachment: await getStreamsFromAttachment(
                        event.attachments.filter(item => mediaTypes.includes(item.type))
                    )
                };

                api.sendMessage(formMessage, threadID, (err, info) => {
                    if (err) return message.err(err);
                    message.reply(getLang("replyUserSuccess"));
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        messageIDSender: event.messageID,
                        threadID: event.threadID,
                        type: "adminReply"
                    });
                }, messageIDSender);
                break;
            }
            case "adminReply": {
                let sendByGroup = "";
                if (isGroup) {
                    const { threadName } = await api.getThreadInfo(event.threadID);
                    sendByGroup = getLang("sendByGroup", threadName, event.threadID);
                }
                const formMessage = {
                    body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
                    mentions: [{ id: event.senderID, tag: senderName }],
                    attachment: await getStreamsFromAttachment(
                        event.attachments.filter(item => mediaTypes.includes(item.type))
                    )
                };

                api.sendMessage(formMessage, threadID, (err, info) => {
                    if (err) return message.err(err);
                    message.reply(getLang("replySuccess"));
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        messageIDSender: event.messageID,
                        threadID: event.threadID,
                        type: "userCallAdmin"
                    });
                }, messageIDSender);
                break;
            }
            default: break;
        }
    }
};
                                
