const { getTime, drive } = global.utils;
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "2.2",
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
            welcomeMessage: `╭─🌸⋅✧₊˚.BOT JOIN.˚₊✧⋅🌸─╮\n│\n│ 🌸 Cảm ơn bạn đã mời bot vào nhóm! 🫶\n│ Prefix: %1 💙\n│ Gõ %1help để xem lệnh nha~ ✨\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
            multiple1: "bạn",
            multiple2: "các bạn",
            defaultWelcomeMessage: `╭─🌸⋅✧₊˚.BIENVENUE KAWAII.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ Salut {userName}~ 💙\n│ ✨ Bienvenue {multiple} dans la famille:\n│ 🫶 {boxName}\n│ 💙 Passe une bonne journée {session}~\n│\n│ ♻ Respecte les règles stp~ On est là\n│ pour s'amuser ensemble ♻\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
        },
        en: {
            session1: "🌅 morning",
            session2: "☀️ noon",
            session3: "🌇 afternoon",
            session4: "🌙 evening",
            welcomeMessage: `╭─🌸⋅✧₊˚.BOT JOIN.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ 𝑰𝑵𝑪𝑶𝑵𝑼-𝑿𝑫-𝑽2 ✨🌸\n│\n│ 𝑴𝒆𝒓𝒄𝒊 𝒅𝒆 𝒎'𝒂𝒗𝒐𝒊𝒓 𝒊𝒏𝒗𝒊𝒕𝒆́~ 🫶\n│ 𝗕𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅: %1 💙\n│ 𝑻𝒂𝒑𝒆: %1𝗵𝗲𝗹𝗽 𝒑𝒐𝒖𝒓 𝒗𝒐𝒊𝒓 𝒎𝒆𝒔 𝒄𝒐𝒎𝒂𝒏𝒅𝒆𝒔~ ✨\n│\n│ ♻ 𝑺𝒖𝒊𝒔 𝒍𝒆𝒔 𝒓𝒆̀𝒈𝒍𝒆𝒔 𝒔𝒕𝒑~ 𝑺𝒐𝒚𝒐𝒏𝒔\n│ 𝒎𝒊𝒈𝒏𝒐𝒏𝒔 𝒆𝒏𝒔𝒆𝒎𝒃𝒍𝒆 ♻\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
            multiple1: "𝒕𝒐𝒊",
            multiple2: "𝒗𝒐𝒖𝒔 𝒕𝒐𝒖𝒔",
            defaultWelcomeMessage: `╭─🌸⋅✧₊˚.BIENVENUE KAWAII.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ 𝑺𝒂𝒍𝒖𝒕 {userName}~ 💙\n│ ✨ 𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖 {multiple} 𝒅𝒂𝒏𝒔 𝒍𝒂 𝒇𝒂𝒎𝒊𝒍𝒆:\n│ 🫶 {boxName}\n│ 💙 𝑷𝒂𝒔𝒆 𝒖𝒏𝒆 𝒃𝒐𝒏𝒆 𝒋𝒐𝒖𝒓𝒏𝒆́𝒆 {session}~\n│\n│ ♻ 𝑹𝒆𝒔𝒑𝒆𝒄𝒕𝒆 𝒍𝒆𝒔 𝒓𝒆̀𝒈𝒍𝒆𝒔 𝒔𝒕𝒑~ 𝑶𝒏 𝒆𝒔𝒕 𝒍𝒂̀\n│ 𝒑𝒐𝒖𝒓 𝒔'𝒂𝒎𝒖𝒔𝒆𝒓 𝒆𝒏𝒔𝒆𝒎𝒃𝒍𝒆 ♻\n│\n│ 🐔🌬 𝑺𝒐𝒚𝒐𝒏𝒔 𝒎𝒊𝒈𝒏𝒐𝒏𝒔 𝒆𝒕 𝒖𝒏𝒊𝒔~ 😘😊\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType == "log:subscribe")
            return async function () {
                const hours = getTime("HH");
                const { threadID } = event;
                const { nickNameBot } = global.GoatBot.config;
                const prefix = global.utils.getPrefix(threadID);
                const dataAddedParticipants = event.logMessageData.addedParticipants;

                // GIF kawaii mignon pour welcome 🥺
                const gifUrl = "https://i.ibb.co/GfM3tTdj/ae12b7941d73.gif";
                const cachePath = path.join(__dirname, 'cache', `welcome_${Date.now()}.gif`);

                // if new member is bot
                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                    if (nickNameBot)
                        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                    return message.send(getLang("welcomeMessage", prefix));
                }

                if (!global.temp.welcomeEvent[threadID])
                    global.temp.welcomeEvent[threadID] = {
                        joinTimeout: null,
                        dataAddedParticipants: []
                    };

                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
                    const threadData = await threadsData.get(threadID);
                    if (threadData.settings.sendWelcomeMessage == false)
                        return;
                    const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                    const dataBanned = threadData.data.banned_ban || [];
                    const threadName = threadData.threadName;
                    const userName = [],
                        mentions = [];
                    let multiple = false;

                    if (dataAddedParticipants.length > 1)
                        multiple = true;

                    for (const user of dataAddedParticipants) {
                        if (dataBanned.some((item) => item.id == user.userFbId))
                            continue;
                        
                        const userId = user.userFbId;
                        const fullName = user.fullName;
                        
                        userName.push(fullName);
                        mentions.push({
                            tag: fullName,
                            id: userId
                        });

                        // Ton message kawaii personnalisé pour chaque user
                        const timeStr = new Date().toLocaleString("en-BD", {
                            timeZone: "Asia/Dhaka",
                            hour: "2-digit", minute: "2-digit", second: "2-digit",
                            weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
                            hour12: true,
                        });

                        // Télécharger GIF kawaii pour chaque user
                        try {
                            if (!fs.existsSync(path.dirname(cachePath))) {
                                fs.mkdirSync(path.dirname(cachePath), { recursive: true });
                            }
                            const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
                            const userGifPath = path.join(__dirname, 'cache', `welcome_${userId}_${Date.now()}.gif`);
                            fs.writeFileSync(userGifPath, Buffer.from(response.data, 'utf-8'));

                            await api.sendMessage({
                                body:
                                    `╭─🌸⋅✧₊˚.WELCOME.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ 𝐇𝐞𝐥𝐨 ${fullName} 💙\n│ ✨ 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 ${threadName} 🫶\n│ 💙 𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 ${threadData.participantIDs.length} 𝐦𝐞𝐦𝐛𝐞𝐫 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩\n│ 🎉 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐣𝐨𝐲~\n│\n│ 📅 ${timeStr}\n│\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
                                attachment: fs.createReadStream(userGifPath),
                                mentions: [{ tag: fullName, id: userId }]
                            }, threadID);

                            fs.unlinkSync(userGifPath);
                        } catch (err) {
                            console.error("Erreur GIF welcome:", err);
                        }
                    }

                    if (userName.length == 0) return;
                    let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

                    const form = {
                        mentions: welcomeMessage.match(/\{userNameTag\}/g)? mentions : null
                    };

                    welcomeMessage = welcomeMessage
                    .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
                    .replace(/\{boxName\}|\{threadName\}/g, threadName)
                    .replace(/\{multiple\}/g, multiple? getLang("multiple2") : getLang("multiple1"))
                    .replace(/\{session\}/g,
                            hours <= 10? getLang("session1") :
                            hours <= 12? getLang("session2") :
                            hours <= 18? getLang("session3") :
                            getLang("session4")
                        );

                    form.body = welcomeMessage;

                    // Ajouter aussi les attachments du thread si y'en a
                    if (threadData.data.welcomeAttachment) {
                        const files = threadData.data.welcomeAttachment;
                        const attachments = files.reduce((acc, file) => {
                            acc.push(drive.getFile(file, "stream"));
                            return acc;
                        }, []);
                        const threadAttachments = (await Promise.allSettled(attachments))
                        .filter(({ status }) => status == "fulfilled")
                        .map(({ value }) => value);

                        form.attachment = threadAttachments;
                    }

                    // Message global kawaii si plusieurs users
                    if (multiple) {
                        message.send(form);
                    }
                    
                    delete global.temp.welcomeEvent[threadID];
                }, 1500);
            };
    }
};
