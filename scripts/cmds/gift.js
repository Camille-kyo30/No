module.exports = {
    config: {
        name: "gift",
        aliases: ["pay", "send", "transfer", "give"],
        version: "1.0",
        author: "Chitron Bhattacharjee",
        editor: "Camille Uchiha 🌸",
        role: 0,
        shortDescription: {
            en: "🌸 Envoie de l'argent mignon à un Hunter ✨"
        },
        description: {
            en: "Transfère tes pièces à un autre Hunter en le taguant~ Cadeau kawaii 💙"
        },
        category: "𝗪𝗔𝗟𝗘𝗧",
        guide: {
            en: "🌸 {pn} @tag <montant> → Ex: gift @Hunter 500 🫶"
        }
    },

    langs: {
        en: {
            missingInput: "🌸 Aïe~ Tag un Hunter et mets un montant stp 🥺\nEx: gift @Hunter 500 💙",
            invalidAmount: "🌸 Aïe~ Le montant doit être positif~ Pas de cadeaux négatifs 🥺",
            notEnough: "🌸💸 Aïe~ T'as pas assez d'argent~ Va farmer d'abord~ 🥺",
            success: "🌸✨ Cadeau envoyé! ✨🌸\n💙 Tu as donné %1$ à %2\n╰─ C'est mignon de partager~ 🫶",
            selfGift: "🌸🤔 Aïe~ Tu peux pas t'offrir un cadeau à toi-même~ Tricheur~ 🥺",
            receive: "🌸🎁 Ooooh cadeau! 🎁✨\n%1 t'a envoyé %2$ ~ Trop gentil~ Merci~ 💙"
        }
    },

    onStart: async function ({ message, event, args, usersData, getLang }) {
        const targetUID = Object.keys(event.mentions)[0];
        const amount = parseInt(args[args.length - 1]);

        if (!targetUID || isNaN(amount) || amount <= 0) {
            return message.reply(getLang("missingInput"));
        }

        if (targetUID == event.senderID) {
            return message.reply(getLang("selfGift"));
        }

        const senderData = await usersData.get(event.senderID);
        if (!senderData || senderData.money < amount) {
            return message.reply(getLang("notEnough"));
        }

        const receiverData = await usersData.get(targetUID);

        // Update sender
        await usersData.set(event.senderID, {
           ...senderData,
            money: senderData.money - amount
        });

        // Update receiver
        await usersData.set(targetUID, {
           ...receiverData,
            money: (receiverData?.money || 0) + amount
        });

        const receiverName = event.mentions[targetUID].replace("@", "");
        const senderName = senderData.name || "Un Hunter";

        // Message au sender
        message.reply(getLang("success", amount.toLocaleString(), receiverName));

        // Notif au receiver si possible
        try {
            await message.api.sendMessage(
                getLang("receive", senderName, amount.toLocaleString()),
                targetUID
            );
        } catch {}
    }
};
