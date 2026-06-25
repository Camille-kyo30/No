function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
    config: {
        name: "filteruser",
        aliases: ["fu", "purge", "filter"],
        version: "1.6",
        author: "Chitron Bhattacharjee",
        editor: "Camille Uchiha 🌸",
        countDown: 5,
        role: 1,
        description: {
            en: "🌸 Nettoyage mignon du groupe~ Filtre les Hunter inactifs ou comptes bloqués ✨"
        },
        category: "𝗕𝗢𝗫",
        guide: {
            en: "🌸 {pn} <nombre msgs> → Kick inactifs\n {pn} die → Kick comptes bloqués 🫥"
        }
    },

    langs: {
        en: {
            needAdmin: "🌸 Aïe~ Mets moi admin du groupe d'abord stp 🥺 Je peux pas nettoyer sans perms 🫡",
            confirm: "🌸⚠️ Confirmation mignonne ⚠️🌸\nTu veux vraiment virer les Hunter avec moins de %1 messages? 🥺\nRéagis avec n'importe quel emoji pour confirmer~ ✨",
            kickByBlock: "🌸✨ Ménage terminé! %1 comptes bloqués virés~ Groupe plus propre~ 🧹💙",
            kickByMsg: "🌸✨ Nettoyage fait! %1 Hunter inactifs [< %2 msgs] ont été virés~ 🧹💙",
            kickError: "❌ Oups~ Impossible de virer %1 Hunter:\n%2 🥺",
            noBlock: "🌸✨ Bonne nouvelle! Aucun compte bloqué dans le groupe~ Tout le monde va bien 💙",
            noMsg: "🌸✨ Trop mignon! Aucun Hunter avec moins de %1 messages~ Tout le monde est actif~ 💙"
        },
        vi: {
            needAdmin: "🌸 Aïe~ Thêm bot làm quản trị viên trước nha 🥺",
            confirm: "🌸⚠️ Xác nhận mignon ⚠️🌸\nBạn có chắc muốn kick member < %1 tin nhắn? 🥺\nThả emoji bất kì để xác nhận~ ✨",
            kickByBlock: "🌸✨ Dọn xong! Đã kick %1 acc die~ Nhóm sạch rồi~ 🧹💙",
            kickByMsg: "🌸✨ Dọn xong! Đã kick %1 member < %2 msgs~ 🧹💙",
            kickError: "❌ Oops~ Không kick được %1 member:\n%2 🥺",
            noBlock: "🌸✨ Tin vui! Không có acc die nào~ 💙",
            noMsg: "🌸✨ Tuyệt vời! Không ai < %1 tin nhắn~ 💙"
        }
    },

    onStart: async function ({ api, args, threadsData, message, event, commandName, getLang }) {
        const threadData = await threadsData.get(event.threadID);
        if (!threadData.adminIDs.includes(api.getCurrentUserID()))
            return message.reply(getLang("needAdmin"));

        if (!isNaN(args[0])) {
            message.reply(getLang("confirm", args[0]), (err, info) => {
                global.GoatBot.onReaction.set(info.messageID, {
                    author: event.senderID,
                    messageID: info.messageID,
                    minimum: Number(args[0]),
                    commandName
                });
            });
        }
        else if (args[0] == "die") {
            const threadInfo = await api.getThreadInfo(event.threadID);
            const membersBlocked = threadInfo.userInfo.filter(user => user.type!== "User");
            const errors = [];
            const success = [];

            if (membersBlocked.length === 0) {
                return message.reply(getLang("noBlock"));
            }

            for (const user of membersBlocked) {
                if (user.type!== "User" &&!threadData.adminIDs.some(id => id == user.id)) {
                    try {
                        await api.removeUserFromGroup(user.id, event.threadID);
                        success.push(user.id);
                    }
                    catch (e) {
                        errors.push(user.name || user.id);
                    }
                    await sleep(700);
                }
            }

            let msg = "🌸✨ RÉSULTAT NETTOYAGE 🧹✨🌸\n\n";
            if (success.length > 0)
                msg += getLang("kickByBlock", success.length) + "\n";
            if (errors.length > 0)
                msg += getLang("kickError", errors.length, errors.join("\n")) + "\n";
            if (msg == "🌸✨ RÉSULTAT NETTOYAGE 🧹✨🌸\n\n")
                msg += getLang("noBlock");
            message.reply(msg);
        }
        else
            message.SyntaxError();
    },

    onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {
        const { minimum = 1, author } = Reaction;
        if (event.userID!= author)
            return message.reply("🌸 Hey toi! C'est pas ta confirmation~ 🥺");

        const threadData = await threadsData.get(event.threadID);
        const botID = api.getCurrentUserID();
        const membersCountLess = threadData.members.filter(member =>
            member.count < minimum
            && member.inGroup == true
            && member.userID!= botID
            &&!threadData.adminIDs.some(id => id == member.userID)
        );

        if (membersCountLess.length === 0) {
            return message.reply(getLang("noMsg", minimum));
        }

        const errors = [];
        const success = [];
        for (const member of membersCountLess) {
            try {
                await api.removeUserFromGroup(member.userID, event.threadID);
                success.push(member.userID);
            }
            catch (e) {
                errors.push(member.name || member.userID);
            }
            await sleep(700);
        }

        let msg = "🌸✨ RÉSULTAT NETTOYAGE 🧹✨🌸\n\n";
        if (success.length > 0)
            msg += getLang("kickByMsg", success.length, minimum) + "\n";
        if (errors.length > 0)
            msg += getLang("kickError", errors.length, errors.join("\n")) + "\n";
        if (msg == "🌸✨ RÉSULTAT NETTOYAGE 🧹✨🌸\n\n")
            msg += getLang("noMsg", minimum);
        message.reply(msg);
    }
};
