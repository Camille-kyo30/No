const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
	config: {
		name: "admin",
	version: "1.7",
	author: "Christus",
		editor: "Camille Uchiha 🌸",
		countDown: 5,
	role: 3,
		description: {
			fr: "🌸 Gestion admin kawaii du bot",
			en: "🌸 Kawaii admin role management"
	},
		category: "discussion de groupe",
	guide: {
			fr: `╭─🌸⋅✧₊˚.GUIDE ADMIN.˚₊✧⋅🌸─╮
│
│ ✨ {pn} add @tag → ajouter admin 🫶
│ 💙 {pn} remove @tag → retirer admin 🥺
│ 👑 {pn} list → liste admins ✨
╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			en: `╭─🌸⋅✧₊˚.GUIDE ADMIN.˚₊✧⋅🌸─╮
│
│ ✨ {pn} add @tag → add admin 🫶
│ 💙 {pn} remove @tag → remove admin 🥺
│ 👑 {pn} list → list admins ✨
╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
	}
	},

	langs: {
	fr: {
			added: `╭─🌸⋅✧₊˚.ADMIN AJOUTÉ.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ %1 admin(s) ajouté(s):\n%2\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			alreadyAdmin: `\n╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💙 %1 déjà admin(s):\n%2\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			missingIdAdd: `╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Tag un user ou mets ID stp 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			removed: `╭─🌸⋅✧₊˚.ADMIN RETIRÉ.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 %1 admin(s) retiré(s):\n%2\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			notAdmin: `╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💙 %1 n'étaient pas admin:\n%2\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			missingIdRemove: `╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Tag un user ou mets ID stp 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			listAdmin: `╭─🌸⋅✧₊˚.LISTE ADMINS.˚₊✧⋅🌸─╮\n│\n│ 👑🌸 Admins du bot:\n%1\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
	},
	en: {
			added: `╭─🌸⋅✧₊˚.ADMIN ADDED.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ %1 admin(s) added:\n%2\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			alreadyAdmin: `\n╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💙 %1 already admin(s):\n%2\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			missingIdAdd: `╭─🌸⋅✧₊˚.ERROR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Tag user or enter ID pls 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			removed: `╭─🌸⋅✧₊˚.ADMIN REMOVED.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 %1 admin(s) removed:\n%2\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			notAdmin: `╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💙 %1 weren't admin:\n%2\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			missingIdRemove: `╭─🌸⋅✧₊˚.ERROR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Tag user or enter ID pls 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
			listAdmin: `╭─🌸⋅✧₊˚.ADMIN LIST.˚₊✧⋅🌸─╮\n│\n│ 👑🌸 Bot admins:\n%1\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
	}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
	// GIF kawaii pour admin 🌸
		const gifUrl = "https://i.ibb.co/sJjVsf2T/941ec9120662.gif";
		const cachePath = path.join(__dirname, 'cache', `admin_${Date.now()}.gif`);

		if (!fs.existsSync(path.dirname(cachePath))) {
			fs.mkdirSync(path.dirname(cachePath), { recursive: true });
	}
		const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
		fs.writeFileSync(cachePath, Buffer.from(response.data, 'utf-8'));

		const sendWithGif = async (body) => {
			const res = await message.reply({ body, attachment: fs.createReadStream(cachePath) });
			setTimeout(() => fs.unlinkSync(cachePath), 3000);
			return res;
	}

		switch (args[0]) {

			// Ajout d'admin
			case "add":
			case "-a": {
				if (!args[1]) return message.reply(getLang("missingIdAdd"));

				let uids = [];
				if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
				else if (event.messageReply) uids.push(event.messageReply.senderID);
				else uids = args.filter(arg => !isNaN(arg));

				const notAdminIds = [], adminIds = [];
				for (const uid of uids) {
					config.adminBot.includes(uid) ? adminIds.push(uid) : notAdminIds.push(uid);
				}

				config.adminBot.push(...notAdminIds);

				const getNames = await Promise.all(uids.map(uid =>
					usersData.getName(uid).then(name => ({ uid, name }))
				));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const msg = 
					(notAdminIds.length > 0? getLang("added", notAdminIds.length, getNames.filter(x => notAdminIds.includes(x.uid)).map(({ uid, name }) => `│ ✨ ${name} (${uid}) 🫶`).join("\n")) : "") +
					(adminIds.length > 0? getLang("alreadyAdmin", adminIds.length, getNames.filter(x => adminIds.includes(x.uid)).map(({ uid, name }) => `│ 💙 ${name} (${uid}) ✨`).join("\n")) : "");
				
				return sendWithGif(msg);
			}

			// Suppression d'admin
			case "remove":
			case "-r": {
				if (!args[1]) return message.reply(getLang("missingIdRemove"));

				let uids = [];
				if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
				else uids = args.filter(arg => !isNaN(arg));

				const notAdminIds = [], adminIds = [];
				for (const uid of uids) {
					config.adminBot.includes(uid) ? adminIds.push(uid) : notAdminIds.push(uid);
				}

				for (const uid of adminIds) config.adminBot.splice(config.adminBot.indexOf(uid), 1);

				const getNames = await Promise.all(adminIds.map(uid =>
					usersData.getName(uid).then(name => ({ uid, name }))
				));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const msg =
					(adminIds.length > 0? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `│ 💔 ${name} (${uid}) 🥺`).join("\n")) : "") +
					(notAdminIds.length > 0? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `│ 💙 ${uid} ✨`).join("\n")) : "");

				return sendWithGif(msg);
			}

			// Liste des admins
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid =>
					usersData.getName(uid).then(name => ({ uid, name }))
				));
				const msg = getLang("listAdmin", getNames.map(({ uid, name }) => `│ 👑 ${name} (${uid}) ✨`).join("\n"));
				return sendWithGif(msg);
			}

			default:
				return message.SyntaxError();
	}
	}
};
