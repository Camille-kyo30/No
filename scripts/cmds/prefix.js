const fs = require("fs-extra");
const { utils } = global;
const axios = require('axios');
const path = require('path');

module.exports = {
	config: {
		name: "prefix",
	version: "1.5",
	author: "NTKhang / Christus",
		editor: "Camille Uchiha 🌸",
		countDown: 5,
	role: 0,
		description: "🌸 Changer préfixe kawaii du bot",
		category: "config",
	guide: {
			vi: " {pn} <new prefix>: thay đổi prefix mới trong box chat của bạn"
				+ "\n Ví dụ:"
				+ "\n {pn} #"
				+ "\n\n {pn} <new prefix> -g: thay đổi prefix mới trong hệ thống bot (chỉ admin bot)"
				+ "\n Ví dụ:"
				+ "\n {pn} # -g"
				+ "\n\n {pn} reset: thay đổi prefix trong box chat của bạn về mặc định",
			en: `╭─🌸⋅✧₊˚.GUIDE PREFIX.˚₊✧⋅🌸─╮
│
│ ✨ {pn} <prefix> → change groupe 🫶
│ 💙 {pn} <prefix> -g → global admin 👑
│ 🥺 {pn} reset → reset défaut ✨
╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			fr: `╭─🌸⋅✧₊˚.GUIDE PREFIX.˚₊✧⋅🌸─╮
│
│ ✨ {pn} <nouveau préfixe> → groupe 🫶
│ 💙 {pn} <préfixe> -g → global admin 👑
│ 🥺 {pn} reset → reset défaut ✨
╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
	}
	},

	langs: {
	vi: {
			reset: "Đã reset prefix của bạn về mặc định: %1",
			onlyAdmin: "Chỉ admin mới có thể thay đổi prefix hệ thống bot",
			confirmGlobal: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix của toàn bộ hệ thống bot",
			confirmThisThread: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix trong nhóm chat của bạn",
			successGlobal: "Đã thay đổi prefix hệ thống bot thành: %1",
			successThisThread: "Đã thay đổi prefix trong nhóm chat của bạn thành: %1",
			myPrefix: "👋 Hey %1, did you ask for my prefix?\n➥ 🌐 Global: %2\n➥ 💬 This Chat: %3\nI'm %4 at your service 🫡"
	},
	en: {
			reset: "Your prefix reset to default: %1",
			onlyAdmin: "Only admin can change prefix of system bot",
			confirmGlobal: "Please react to this message to confirm change prefix of system bot",
			confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
			successGlobal: "Changed prefix of system bot to: %1",
			successThisThread: "Changed prefix in your box chat to: %1",
			myPrefix: "👋 Hey %1, did you ask for my prefix?\n➥ 🌐 Global: %2\n➥ 💬 This Chat: %3\nI'm %4 at your service 🫡"
	},
	fr: {
			reset: `╭─🌸⋅✧₊˚.RESET.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ Préfixe reset à: %1 🫶\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			onlyAdmin: `╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Seul admin bot peut changer prefix global 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			confirmGlobal: `╭─🌸⋅✧₊˚.CONFIRMATION.˚₊✧⋅🌸─╮\n│\n│ 🌸👑 Confirme changement prefix global 🫶\n│ 💙 Réagis à ce message ✨\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			confirmThisThread: `╭─🌸⋅✧₊˚.CONFIRMATION.˚₊✧⋅🌸─╮\n│\n│ 🌸💙 Confirme changement prefix groupe 🫶\n│ ✨ Réagis à ce message 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			successGlobal: `╭─🌸⋅✧₊˚.SUCCÈS.˚₊✧⋅🌸─╮\n│\n│ 🌸👑 Prefix global changé: %1 ✨\n│ 💙 Actif partout maintenant 🫶\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			successThisThread: `╭─🌸⋅✧₊˚.SUCCÈS.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ Prefix groupe changé: %1 💙\n│ 🫶 Actif ici maintenant 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			myPrefix: `╭─🌸⋅✧₊˚.INFO PREFIX.˚₊✧⋅🌸─╮\n│\n│ 👋 Hey %1~ Tu cherches mon préfixe? 🥺\n│ ────────────────\n│ 🌐 Global: %2 ✨\n│ 💬 Ce groupe: %3 💙\n│ 👑 Je suis %4 à ton service 🫡\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
	}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

	// GIF kawaii pour prefix 🌸
		const gifUrl = "https://i.ibb.co/sJjVsf2T/941ec9120662.gif";
		const cachePath = path.join(__dirname, 'cache', `prefix_${Date.now()}.gif`);

		if (!fs.existsSync(path.dirname(cachePath))) {
			fs.mkdirSync(path.dirname(cachePath), { recursive: true });
	}
		const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
		fs.writeFileSync(cachePath, Buffer.from(response.data, 'utf-8'));

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			const res = await message.reply({
				body: getLang("reset", global.GoatBot.config.prefix),
				attachment: fs.createReadStream(cachePath)
			});
			setTimeout(() => fs.unlinkSync(cachePath), 3000);
			return;
	}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
	};

		if (args[1] === "-g")
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		else
			formSet.setGlobal = false;

		const res = await message.reply({
			body: args[1] === "-g"? getLang("confirmGlobal") : getLang("confirmThisThread"),
			attachment: fs.createReadStream(cachePath)
	}, (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
	});
		setTimeout(() => fs.unlinkSync(cachePath), 5000);
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID!== author)
			return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
	}
		else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
	}
	},

	onChat: async function ({ event, message, getLang, usersData }) {
		if (event.body && event.body.toLowerCase() === "prefix")
			return async () => {
				const userName = await usersData.getName(event.senderID);
				const botName = global.GoatBot.config.nickNameBot || "Bot";
				return message.reply(getLang("myPrefix", userName, global.GoatBot.config.prefix, utils.getPrefix(event.threadID), botName));
			};
	}
};
