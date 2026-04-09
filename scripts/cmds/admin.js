const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "1.6",
		author: "Camille-Dev 🩵",
		countDown: 5,
		role: 3,
		description: {
			fr: "Donner ou retirer le grade de Chef de Quartier (Admin)",
			en: "Add, remove, edit admin role"
		},
		category: "propriétaire",
		guide: {
			fr: '   {pn} [add | -a] <uid | @tag> : Nommer un nouveau chef'
				+ '\n   {pn} [remove | -r] <uid | @tag> : Destituer un chef'
				+ '\n   {pn} [list | -l] : Voir qui gère le terrain',
			en: '   {pn} [add | -a] <uid | @tag> : Add admin role'
				+ '\n   {pn} [remove | -r] <uid | @tag> : Remove admin role'
				+ '\n   {pn} [list | -l] : List all admins'
		}
	},

	langs: {
		fr: {
			added: "┏━━━━━ 🎖️ ━━━━━┓\n   𝗡𝗢𝗨𝗩𝗘𝗔𝗨 𝗖𝗛𝗘𝗙\n┗━━━━━ 🎖️ ━━━━━┛\n\n✅ C'est gâté ! %1 nouveau(x) mogo(s) ont pris du galon :\n%2",
			alreadyAdmin: "\n⚠️ Ahiii ! Ces %1 mogos là sont déjà au pouvoir :\n%2",
			missingIdAdd: "❌ Vieux père, faut me dire qui on doit nommer chef ! (ID ou @tag)",
			removed: "┏━━━━━ 🚷 ━━━━━┓\n   𝗗𝗘𝗦𝗧𝗜𝗧𝗨𝗧𝗜𝗢𝗡\n┗━━━━━ 🚷 ━━━━━┛\n\n✅ On a retiré le fer à %1 mogo(s). Ils redevenus civils :\n%2",
			notAdmin: "⚠️ Mais %1 utilisateur(s) là n'avaient même pas de grade :\n%2",
			missingIdRemove: "❌ Il faut me donner le nom ou l'ID de celui qu'on doit descendre du trône.",
			listAdmin: "┏━━━━━ 👑 ━━━━━┓\n   𝗟𝗘𝗦 𝗚𝗥𝗔𝗡𝗗𝗦 𝗠𝗢𝗚𝗢𝗦\n┗━━━━━ 👑 ━━━━━┛\n\nVoici ceux qui gèrent le quartier avec Camille 🇨🇮 :\n\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		switch (args[0]) {

			// Nomination de chef
			case "add":
			case "-a": {
				if (!args[1] && !event.messageReply) return message.reply(getLang("missingIdAdd"));

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

				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(n => notAdminIds.includes(n.uid)).map(({ uid, name }) => `✨ ${name} [${uid}]`).join("\n")) : "") +
					(adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
				);
			}

			// Destitution
			case "remove":
			case "-r": {
				if (!args[1] && !event.messageReply) return message.reply(getLang("missingIdRemove"));

				let uids = [];
				if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
				else if (event.messageReply) uids.push(event.messageReply.senderID);
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

				return message.reply(
					(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `👤 ${name} [${uid}]`).join("\n")) : "") +
					(notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
				);
			}

			// La Liste des mogos puissants
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid =>
					usersData.getName(uid).then(name => ({ uid, name }))
				));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `💎 ${name} (${uid})`).join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};
					
