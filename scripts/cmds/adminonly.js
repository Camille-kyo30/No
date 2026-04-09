const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "adminonly",
		aliases: ["adonly", "onlyad", "onlyadmin", "vip"],
		version: "1.5",
		author: "Camille",
		countDown: 5,
		role: 3,
		description: {
			fr: "Bloquer le bot pour que seuls les chefs puissent parler",
			en: "Turn on/off only admin can use bot"
		},
		category: "propriétaire",
		guide: {
			fr: "   {pn} [on | off] : Activer/couper le mode Carré VIP\n   {pn} noti [on | off] : Activer/couper les palabres du bot quand un petit touche à ça",
			en: "   {pn} [on | off] : turn on/off the mode only admin can use bot\n   {pn} noti [on | off] : notification toggle"
		}
	},

	langs: {
		fr: {
			turnedOn: "┏━━━━━ 🔒 ━━━━━┓\n   𝗠𝗢𝗗𝗘 𝗖𝗔𝗥𝗥𝗘́ 𝗩𝗜𝗣\n┗━━━━━ 🔒 ━━━━━┛\n\nC'est bouclé ! 🚪 Maintenant, seuls les vrais mogos (admins) peuvent me parler. Les gnatas sont au dehors ! ✋🏾",
			turnedOff: "┏━━━━━ 🔓 ━━━━━┓\n   𝗠𝗢𝗗𝗘 𝗣𝗨𝗕𝗟𝗜𝗖\n┗━━━━━ 🔓 ━━━━━┛\n\nC'est libéré ! 🎉 Tout le quartier peut s'amuser avec moi maintenant. On est ensemble !",
			turnedOnNoti: "🔔 [𝗜𝗡𝗙𝗢]\n\nMaintenant, si un petit mogo essaie de m'utiliser sans permission, je vais lui crier dessus proprement ! 🗣️",
			turnedOffNoti: "🔕 [𝗜𝗡𝗙𝗢]\n\nJe vais rester calme. Si un non-admin me touche, je l'ignore seulement, pas de palabres. 🤐"
		}
	},

	onStart: function ({ args, message, getLang }) {
		let isSetNoti = false;
		let value;
		let indexGetVal = 0;

		if (args[0] === "noti") {
			isSetNoti = true;
			indexGetVal = 1;
		}

		if (args[indexGetVal] === "on") value = true;
		else if (args[indexGetVal] === "off") value = false;
		else return message.SyntaxError();

		if (isSetNoti) {
			config.hideNotiMessage.adminOnly = !value;
			message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
		} else {
			config.adminOnly.enable = value;
			message.reply(getLang(value ? "turnedOn" : "turnedOff"));
		}

		fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
	}
};
