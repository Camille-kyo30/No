const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
    config: {
        name: "setleave",
        aliases: ["setl", "leave", "leaveconfig"],
        version: "1.7",
        author: "Chitron Bhattacharjee",
        editor: "Camille Uchiha 🌸",
        countDown: 5,
        role: 0,
        description: {
            en: "🌸 Personnalise le message d'au revoir mignon quand un Hunter quitte le groupe ✨"
        },
        category: "custom",
        guide: {
            en: {
                body: `🌸 GUIDE MINI SETLEAVE ✨
{pn} on → Active message d'au revoir kawaii 🫶
{pn} off → Désactive message d'au revoir 🫥
{pn} text <contenu> → Change le texte mignon
{pn} text reset → Remet texte par défaut 🌸
{pn} file → Ajoute image/video/audio mignon
{pn} file reset → Supprime fichier joint 💙

RACCOURCIS KAWAI:
+ {userName} → Nom du Hunter qui part
+ {userNameTag} → Tag du Hunter 🫡
+ {boxName} → Nom du groupe ✨
+ {type} → parti/kick par admin
+ {session} → matin/après-midi/soir

Ex: {pn} text {userName} a {type} le groupe {boxName}~ À bientôt 🤧💙`,
                attachment: {
                    [`${__dirname}/assets/guide/setleave/setleave_en_1.png`]: "https://i.ibb.co/2FKJHJr/guide1.png"
                }
            }
        }
    },

    langs: {
        en: {
            turnedOn: "🌸✨ Message d'au revoir ACTIVÉ! ✨\nJe vais dire au revoir mignon aux Hunter qui partent~ 🫶",
            turnedOff: "🌸🫥 Message d'au revoir DÉSACTIVÉ!\nPlus de messages quand quelqu'un part~ 🥺",
            missingContent: "🌸 Aïe~ Mets un contenu pour le message stp 🥺\nEx: setleave text À bientôt {userName} 💙",
            edited: "🌸✨ Message d'au revoir modifié avec succès! ✨\nContenu: %1\n╰─ Trop mignon maintenant~ 🫶",
            reseted: "🌸✨ Message d'au revoir reset! ✨\nRetour au texte par défaut mignon~ 💙",
            noFile: "🌸 Aïe~ Y'a pas de fichier à supprimer~ 🥺",
            resetedFile: "🌸✨ Fichier joint supprimé avec succès! ✨\nLe message d'au revoir est clean~ 💙",
            missingFile: "🌸 Aïe~ Réponds à ce message avec une image/video/audio stp 🥺",
            addedFile: "🌸✨ %1 fichier(s) ajouté(s) avec succès! ✨\nTon message d'au revoir est encore plus mignon~ 🫶"
        },
        vi: {
            turnedOn: "🌸✨ Bật tin nhắn tạm biệt thành công! ✨\nBot sẽ chào tạm biệt dễ thương~ 🫶",
            turnedOff: "🌸🫥 Tắt tin nhắn tạm biệt thành công! 🥺",
            missingContent: "🌸 Aïe~ Nhập nội dung tin nhắn đi 🥺",
            edited: "🌸✨ Đã chỉnh sửa tin nhắn tạm biệt! ✨\nNội dung: %1\n╰─ Dễ thương quá~ 🫶",
            reseted: "🌸✨ Đã reset tin nhắn tạm biệt! ✨",
            noFile: "🌸 Aïe~ Không có file để xóa~ 🥺",
            resetedFile: "🌸✨ Đã reset file thành công! ✨",
            missingFile: "🌸 Aïe~ Reply tin nhắn này kèm ảnh/video/audio nha 🥺",
            addedFile: "🌸✨ Đã thêm %1 file thành công! ✨\nTin nhắn dễ thương hơn rồi~ 🫶"
        }
    },

    onStart: async function ({ args, threadsData, message, event, commandName, getLang }) {
        const { threadID, senderID, body } = event;
        const { data, settings } = await threadsData.get(threadID);

        switch (args[0]) {
            case "text": {
                if (!args[1])
                    return message.reply(getLang("missingContent"));
                else if (args[1] == "reset") {
                    delete data.leaveMessage;
                    await threadsData.set(threadID, { data });
                    return message.reply(getLang("reseted"));
                }
                else {
                    data.leaveMessage = body.slice(body.indexOf(args[0]) + args[0].length).trim();
                    await threadsData.set(threadID, { data });
                    message.reply(getLang("edited", data.leaveMessage));
                }
                break;
            }

            case "file": {
                if (args[1] == "reset") {
                    const { leaveAttachment } = data;
                    if (!leaveAttachment || leaveAttachment.length == 0)
                        return message.reply(getLang("noFile"));
                    try {
                        await Promise.all(data.leaveAttachment.map(fileId => drive.deleteFile(fileId)));
                        delete data.leaveAttachment;
                    }
                    catch (e) { }

                    await threadsData.set(threadID, { data });
                    message.reply(getLang("resetedFile"));
                }
                else if (event.attachments.length == 0 && (!event.messageReply || event.messageReply.attachments.length == 0)) {
                    return message.reply(getLang("missingFile"), (err, info) => {
                        global.GoatBot.onReply.set(info.messageID, {
                            messageID: info.messageID,
                            author: senderID,
                            commandName
                        });
                    });
                }
                else {
                    saveChanges(message, event, threadID, senderID, threadsData, getLang);
                }
                break;
            }

            case "on": {
                settings.sendLeaveMessage = true;
                await threadsData.set(threadID, { settings });
                message.reply(getLang("turnedOn"));
                break;
            }

            case "off": {
                settings.sendLeaveMessage = false;
                await threadsData.set(threadID, { settings });
                message.reply(getLang("turnedOff"));
                break;
            }

            default:
                message.SyntaxError();
                break;
        }
    },

    onReply: async function ({ event, Reply, message, threadsData, getLang }) {
        const { threadID, senderID } = event;
        if (senderID != Reply.author)
            return message.reply("🌸 Hey~ C'est pas toi qui a demandé~ 🥺");

        if (event.attachments.length == 0 && (!event.messageReply || event.messageReply.attachments.length == 0))
            return message.reply(getLang("missingFile"));
        saveChanges(message, event, threadID, senderID, threadsData, getLang);
    }
};

async function saveChanges(message, event, threadID, senderID, threadsData, getLang) {
    const { data } = await threadsData.get(threadID);
    const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])].filter(item => ["photo", 'png', "animated_image", "video", "audio"].includes(item.type));
    
    if (attachments.length == 0) {
        return message.reply("🌸 Aïe~ Fichier pas supporté~ Mets image/video/audio stp 🥺");
    }

    if (!data.leaveAttachment)
        data.leaveAttachment = [];

    await Promise.all(attachments.map(async attachment => {
        const { url } = attachment;
        const ext = getExtFromUrl(url);
        const fileName = `${getTime()}.${ext}`;
        const infoFile = await drive.uploadFile(`setleave_${threadID}_${senderID}_${fileName}`, await getStreamFromURL(url));
        data.leaveAttachment.push(infoFile.id);
    }));

    await threadsData.set(threadID, { data });
    message.reply(getLang("addedFile", attachments.length));
}
