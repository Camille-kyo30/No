module.exports = {
	config: {
		name: "kick",
	version: "1.4",
	author: "NTKhang",
		editor: "Camille Uchiha 🌸",
		countDown: 5,
	role: 1,
		description: {
			vi: "Kick thành viên khỏi box chat",
			en: "🌸✨ Kick member kawaii from group 🫶"
	},
		category: "box chat",
	guide: {
			vi: "   {pn} @tags: dùng để kick những người được tag",
			en: `╭─🌸⋅✧₊˚.GUIDE KICK.˚₊✧⋅🌸─╮
│
│ ✨ {pn} @tag → kick membre 🥺
│ 💙 Répondre au msg → kick aussi
│ 🫶 Bot doit être admin stp~
╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
	}
	},

	langs: {
	vi: {
			needAdmin: "Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này"
	},
		en: {
			needAdmin: `╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Bot doit être admin stp 🥺\n│ 💙 Ajoute admin au bot d'abord\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
	}
	},

	onStart: async function ({ message, event, args, threadsData, api, getLang }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));

		async function kickAndCheckError(uid, name) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
				message.reply(`╭─🌸⋅✧₊˚.KICK.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 ${name} kick du groupe 🥺\n│ 💙 Bye bye~ ✨\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
			}
			catch (e) {
				message.reply(getLang("needAdmin"));
				return "ERROR";
			}
	}

		if (!args[0]) {
			if (!event.messageReply)
				return message.SyntaxError();
			
			const info = await api.getUserInfo(event.messageReply.senderID);
			const name = info[event.messageReply.senderID].name;
			await kickAndCheckError(event.messageReply.senderID, name);
	}
		else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.SyntaxError();
			
			const name = event.mentions[uids[0]];
			if (await kickAndCheckError(uids.shift(), name) === "ERROR")
				return;
			
			for (const uid of uids) {
				const name = event.mentions[uid];
				api.removeUserFromGroup(uid, event.threadID);
				message.reply(`╭─🌸⋅✧₊˚.KICK.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 ${name} kick aussi 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
			}
	}
	}
};
