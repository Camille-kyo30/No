module.exports = {
    config: {
        name: "botnick",
        aliases: ["sn", "nickname", "setnick"],
        version: "1.0",
        author: "BaYjid",
        editor: "Camille Uchiha 🌸",
        countDown: 5,
        role: 2,
        shortDescription: {
            en: "🌸 Change le surnom mignon du bot dans tous les groupes ✨"
        },
        longDescription: {
            en: "Change le pseudo du bot en mode kawaii dans tous les groupes d'un coup~ 🫶"
        },
        category: "owner",
        guide: {
            en: "{pn} <nouveau surnom kawaii> → Ex: botnick MiniBot ✨"
        },
        envConfig: {
            delayPerGroup: 250
        }
    },

    langs: {
        en: {
            missingNickname: "🌸 Aïe~ Mets un surnom mignon pour moi stp 🥺\nEx: botnick MiniBot ✨",
            changingNickname: "🌸✨ Changement en cours~ Je mets mon surnom '%1' dans %2 groupes mignons 🫶",
            errorChangingNickname: "❌ Aïe~ Erreur dans %1 groupes:\n%2 🥺",
            successMessage: "🌸✨ Succès! Mon surnom est maintenant '%1' dans tous les groupes~ Merci boss 🫡💙",
            sendingNotification: "🌸 J'envoie une notif dans %1 groupes pour dire mon nouveau nom~ ✨",
            partialSuccess: "🌸✨ Presque parfait~ Surnom '%1' changé partout sauf %2 groupes 🥺"
        }
    },

    onStart: async function({ api, args, threadsData, message, getLang }) {
        const newNickname = args.join(" ").trim();

        if (!newNickname) {
            return message.reply(getLang("missingNickname"));
        }

        const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
        const threadIds = allThreadID.map(thread => thread.threadID);

        message.reply(getLang("changingNickname", newNickname, threadIds.length));

        const nicknameChangePromises = threadIds.map(async threadId => {
            try {
                await new Promise(resolve => setTimeout(resolve, 250)); // delay kawaii
                await api.changeNickname(newNickname, threadId, api.getCurrentUserID());
                return { status: "fulfilled", threadId };
            } catch (error) {
                console.error(`🌸 Failed groupe ${threadId}: ${error.message}`);
                return { status: "rejected", threadId, error: error.message };
            }
        });

        const results = await Promise.all(nicknameChangePromises);
        const failedThreads = results.filter(r => r.status === "rejected");

        message.reply(getLang("sendingNotification", threadIds.length));

        if (failedThreads.length === 0) {
            message.reply(getLang("successMessage", newNickname));
        } else {
            const failedIds = failedThreads.map(f => f.threadId).slice(0, 5).join(", ");
            const moreText = failedThreads.length > 5 ? ` +${failedThreads.length - 5} autres` : "";
            message.reply(getLang("partialSuccess", newNickname, `${failedIds}${moreText}`));
        }
    }
};
