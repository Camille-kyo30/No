const { writeFileSync } = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
    config: {
        name: "whitelists",
        aliases: ["wlonly", "onlywlst", "onlywhitelist", "wl", "whitelist"],
        version: "1.5",
        author: "Chitron Bhattacharjee",
        editor: "Camille Uchiha 🌸",
        countDown: 5,
        role: 0,
        description: {
            en: "🌸 Gestion VIP mignonne des Hunter autorisés ✨"
        },
        category: "owner",
        guide: {
            en:
`🌸 GUIDE MINI WHITELIST ✨
{pn} add @tag → Ajoute VIP mignon
{pn} remove @tag → Retire VIP
{pn} list → Liste tous les Hunter VIP
{pn} mode on/off → Mode VIP uniquement
{pn} mode noti on/off → Notif quand user pas VIP`
        },
    },

    langs: {
        en: {
            added: `🌸✨ VIP AJOUTÉ ✨🌸\n╭─💙 ${"%1"} Hunter VIP ajouté~ 🫶\n%2\n╰─ Bienvenue dans le club privé!`,
            alreadyAdded: `⚠️ Déjà VIP celui-là~ \n╭─💙 ${"%1"} Hunter déjà VIP\n%2\n╰─ Pas besoin 2 fois mdr 😤`,
            missingIdAdd: "🌸 Aïe~ Mets un UID ou tag quelqu'un stp 🥺",
            removed: `🌸💔 VIP RETIRÉ 💔🌸\n╭─😢 ${"%1"} Hunter plus VIP\n%2\n╰─ Il a perdu ses privilèges~`,
            notAdded: `⚠️ Celui-là VIP pas du tout~ \n╭─💙 ${"%1"} Hunter pas VIP\n%2\n╰─ Rien à retirer mdr`,
            missingIdRemove: "🌸 Aïe~ Mets un UID ou tag pour retirer stp 🥺",
            listAdmin: `🌸✨ LISTE DES HUNTER VIP ✨🌸\n%1\n╰─ Total: ${"%1".split('├‣').length-1} VIP mignons 💙`,
            turnedOn: "🔒 Mode VIP ACTIVÉ~ Seuls les Hunter VIP peuvent utiliser le bot 🫡✨",
            turnedOff: "🔓 Mode VIP DÉSACTIVÉ~ Tout le monde peut utiliser le bot maintenant 🌸",
            turnedOnNoti: "🔔 Notif VIP ACTIVÉE~ Je vais prévenir quand un non-VIP tente 🫡",
            turnedOffNoti: "🔕 Notif VIP DÉSACTIVÉE~ Plus de messages pour les non-VIP 😴",
        },
    },

    onStart: async function ({ message, args, usersData, event, getLang, api }) {
        const permission = global.GoatBot.config.adminBot;
        if (!permission.includes(event.senderID)) {
            return api.sendMessage("🌸 Accès refusé~ Seuls les admins bot peuvent gérer les VIP 🫡", event.threadID, event.messageID);
        }

        switch (args[0]) {
            case "add":
            case "-a":
            case "+": {
                let uids = [];
                if (Object.keys(event.mentions).length > 0)
                    uids = Object.keys(event.mentions);
                else if (event.messageReply) uids.push(event.messageReply.senderID);
                else uids = args.filter((arg) =>!isNaN(arg));

                if (uids.length === 0) return message.reply(getLang("missingIdAdd"));

                const notWLIds = [];
                const authorIds = [];
                for (const uid of uids) {
                    if (config.whiteListMode.whiteListIds.includes(uid))
                        authorIds.push(uid);
                    else notWLIds.push(uid);
                }

                config.whiteListMode.whiteListIds.push(...notWLIds);
                const getNames = await Promise.all(
                    uids.map((uid) =>
                        usersData.getName(uid).then((name) => ({ uid, name }))
                    )
                );
                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                return message.reply(
                    (notWLIds.length > 0
                       ? getLang(
                            "added",
                            notWLIds.length,
                            getNames
                               .filter(x => notWLIds.includes(x.uid))
                               .map(({ uid, name }) => `├‣ Nom: ${name}\n├‣ UID: ${uid}`)
                               .join("\n")
                        )
                        :"") +
                    (authorIds.length > 0
                       ? getLang(
                            "alreadyAdded",
                            authorIds.length,
                            authorIds.map((uid) => `├‣ UID: ${uid}`).join("\n")
                        )
                        :"")
                );
            }

            case "remove":
            case "rm":
            case "-r":
            case "-": {
                let uids = [];
                if (Object.keys(event.mentions).length > 0)
                    uids = Object.keys(event.mentions);
                else if (event.messageReply) uids = [event.messageReply.senderID];
                else uids = args.filter((arg) =>!isNaN(arg));

                if (uids.length === 0) return message.reply(getLang("missingIdRemove"));

                const notWLIds = [];
                const authorIds = [];
                for (const uid of uids) {
                    if (config.whiteListMode.whiteListIds.includes(uid))
                        authorIds.push(uid);
                    else notWLIds.push(uid);
                }

                for (const uid of authorIds)
                    config.whiteListMode.whiteListIds.splice(
                        config.whiteListMode.whiteListIds.indexOf(uid), 1
                    );

                const getNames = await Promise.all(
                    authorIds.map((uid) =>
                        usersData.getName(uid).then((name) => ({ uid, name }))
                    )
                );

                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                return message.reply(
                    (authorIds.length > 0
                       ? getLang(
                            "removed",
                            authorIds.length,
                            getNames
                               .map(({ uid, name }) => `├‣ Nom: ${name}\n├‣ UID: ${uid}`)
                               .join("\n")
                        )
                        :"") +
                    (notWLIds.length > 0
                       ? getLang(
                            "notAdded",
                            notWLIds.length,
                            notWLIds.map((uid) => `├‣ UID: ${uid}`).join("\n")
                        )
                        :"")
                );
            }

            case "list":
            case "-l": {
                const getNames = await Promise.all(
                    config.whiteListMode.whiteListIds.map((uid) =>
                        usersData.getName(uid).then((name) => ({ uid, name }))
                    )
                );
                if (getNames.length === 0) return message.reply("🌸 Aucun Hunter VIP pour l'instant~ La liste est vide 🥺");
                return message.reply(
                    getLang(
                        "listAdmin",
                        getNames
                           .map(({ uid, name }) => `├‣ Nom: ${name}\n├‣ UID: ${uid}`)
                           .join("\n")
                    )
                );
            }

            case "m":
            case "mode":
            case "-m": {
                let isSetNoti = false;
                let value;
                let indexGetVal = 1;

                if (args[1] == "noti") {
                    isSetNoti = true;
                    indexGetVal = 2;
                }

                if (args[indexGetVal] == "on") value = true;
                else if (args[indexGetVal] == "off") value = false;
                else return message.reply("🌸 Usage: whitelist mode on/off OU whitelist mode noti on/off");

                if (isSetNoti) {
                    config.whiteListMode.hideNotiMessage =!value;
                    message.reply(getLang(value? "turnedOnNoti" : "turnedOffNoti"));
                } else {
                    config.whiteListMode.enable = value;
                    message.reply(getLang(value? "turnedOn" : "turnedOff"));
                }

                writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
                break;
            }

            default:
                return message.reply(getLang("missingIdAdd"));
        }
    },
};
