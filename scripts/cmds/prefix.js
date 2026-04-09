const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.5",
		author: "Camille-Dev 🩵",
		countDown: 5,
		role: 0,
		description: "Changer le code d'appel du bot (le préfixe)",
		category: "config",
		guide: {
			fr: "   {pn} <nouveau> : change le préfixe ici\n"
				+ "   Exemple : {pn} #\n\n"
				+ "   {pn} <nouveau> -g : change le signal de tout le système (Élite uniquement)\n"
				+ "   {pn} reset : remet le préfixe de base"
		}
	},

	langs: {
		fr: {
			reset: "✅ Signal réinitialisé ! On repart sur la base : %1",
			onlyAdmin: "✋ STOP ! Seul le Grand Architecte Camille ou ses lieutenants peuvent changer le signal global.",
			confirmGlobal: "⚠️ 𝗔𝗟𝗘𝗥𝗧𝗘 𝗦𝗬𝗦𝗧𝗘̀𝗠𝗘 ⚠️\n\nTu es sur le point de changer le signal de TOUT le bot. Pose une réaction (un emoji) pour confirmer l'ordre.",
			confirmThisThread: "📝 𝗖𝗛𝗔𝗡𝗚𝗘𝗠𝗘𝗡𝗧 𝗗𝗘 𝗖𝗢𝗗𝗘\n\nRéagis à ce message avec un emoji pour valider le nouveau signal dans ce quartier.",
			successGlobal: "🚀 𝗠𝗜𝗦𝗘 𝗔̀ 𝗝𝗢𝗨𝗥 𝗧𝗢𝗧𝗔𝗟𝗘\n\nLe signal universel est maintenant : %1",
			successThisThread: "✅ 𝗖'𝗘𝗦𝗧 𝗚𝗔̂𝗧𝗘́\n\nDans ce quartier, appelez-moi désormais avec : %1",
			myPrefix: "👋 Salut %1, tu cherches le signal ?\n\n🌐 𝗨𝗻𝗶𝘃𝗲𝗿𝘀𝗲𝗹 : %2\n💬 𝗜𝗰𝗶 : %3\n\nJe suis %4, prêt à gérer tes draps 🫡"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g") {
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		} else {
			formSet.setGlobal = false;
		}

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author) return;

		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang, usersData }) {
		if (event.body && event.body.toLowerCase() === "prefix") {
			return async () => {
				const userName = await usersData.getName(event.senderID);
				const botName = global.GoatBot.config.nickNameBot || "Camille-AI";
				return message.reply(getLang("myPrefix", userName.split(' ')[0], global.GoatBot.config.prefix, utils.getPrefix(event.threadID), botName));
			};
		}
	}
};
											 
