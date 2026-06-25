const { getTime, drive } = global.utils;
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "leave",
        version: "1.6",
        author: "NTKhang",
        editor: "Camille Uchiha 🌸",
        category: "events"
    },

    langs: {
        vi: {
            session1: "🌅 buổi sáng",
            session2: "☀️ buổi trưa",
            session3: "🌇 buổi chiều",
            session4: "🌙 buổi tối",
            leaveType1: "tự rời nhóm",
            leaveType2: "bị admin kick",
            defaultLeaveMessage: "🌸💔 {userName} đã {type} khỏi {boxName}...\nHẹn gặp lại {session} nha~ 🥺💙"
        },
        en: {
            session1: "🌅 morning",
            session2: "☀️ noon",
            session3: "🌇 afternoon",
            session4: "🌙 evening",
            leaveType1: "left",
            leaveType2: "was kicked from",
            defaultLeaveMessage: `🌸💔 𝑨𝑫𝑰𝑬𝑼 𝑲𝑨𝑾𝑨𝑰 💔🌸\n\n{userName} {type} 𝒍𝒆 𝒈𝒓𝒐𝒖𝒑𝒆 {boxName}...\n𝑨̀ 𝒃𝒊𝒆𝒏𝒕𝒐̂𝒕 𝒑𝒐𝒖𝒓 𝒖𝒏 𝒃𝒐𝒏 {session}~ 🥺💙\n\n𝑹𝒆𝒗𝒊𝒆𝒏𝒔 𝒗𝒊𝒔𝒊𝒕𝒆𝒓 𝒒𝒖𝒂𝒏𝒅 𝒕𝒖 𝒗𝒆𝒖𝒙~ 🫶`
        }
    },

    onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
        if (event.logMessageType == "log:unsubscribe")
            return async function () {
                const { threadID } = event;
                const threadData = await threadsData.get(threadID);
                if (!threadData.settings.sendLeaveMessage)
                    return;
                const { leftParticipantFbId } = event.logMessageData;
                if (leftParticipantFbId == api.getCurrentUserID())
                    return;
                const hours = getTime("HH");

                const threadName = threadData.threadName;
                const userName = await usersData.getName(leftParticipantFbId) || "Hunter Mystère";

                // GIF kawaii triste pour adieu
                const gifUrl = "https://i.ibb.co/wF9BrThw/e2b0dc70317c.gif";
                const cachePath = path.join(__dirname, 'cache', `leave_${Date.now()}.gif`);

                let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;
                const form = {
                    mentions: leaveMessage.match(/\{userNameTag\}/g)? [{
                        tag: userName,
                        id: leftParticipantFbId
                    }] : null
                };

                leaveMessage = leaveMessage
                   .replace(/\{userName\}|\{userNameTag\}/g, userName)
                   .replace(/\{type\}/g, leftParticipantFbId == event.author? getLang("leaveType1") : getLang("leaveType2"))
                   .replace(/\{threadName\}|\{boxName\}/g, threadName)
                   .replace(/\{time\}/g, hours)
                   .replace(/\{session\}/g, hours <= 10 ?
                        getLang("session1") :
                        hours <= 12 ?
                            getLang("session2") :
                            hours <= 18 ?
                                getLang("session3") :
                                getLang("session4")
                    );

                form.body = leaveMessage;

                if (leaveMessage.includes("{userNameTag}")) {
                    form.mentions = [{
                        id: leftParticipantFbId,
                        tag: userName
                    }];
                }

                // Télécharger et ajouter le GIF adieu kawaii
                try {
                    if (!fs.existsSync(path.dirname(cachePath))) {
                        fs.mkdirSync(path.dirname(cachePath), { recursive: true });
                    }
                    const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
                    fs.writeFileSync(cachePath, Buffer.from(response.data, 'utf-8'));

                    form.attachment = fs.createReadStream(cachePath);
                } catch (err) {
                    console.error("Erreur GIF leave:", err);
                }

                // Ajouter aussi les attachments du thread si y'en a
                if (threadData.data.leaveAttachment) {
                    const files = threadData.data.leaveAttachment;
                    const attachments = files.reduce((acc, file) => {
                        acc.push(drive.getFile(file, "stream"));
                        return acc;
                    }, []);
                    const threadAttachments = (await Promise.allSettled(attachments))
                       .filter(({ status }) => status == "fulfilled")
                       .map(({ value }) => value);

                    form.attachment = form.attachment? [form.attachment,...threadAttachments] : threadAttachments;
                }

                message.send(form, () => {
                    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                });
            };
    }
};
