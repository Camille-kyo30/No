const fs = require("fs-extra");

module.exports = {
	config: {
		name: "restart",
		version: "1.2",
		author: "Camille-Dev 🩵",
		countDown: 5,
		role: 3,
		description: {
			fr: "Relancer le système de Camille",
			en: "Restart bot"
		},
		category: "propriétaire",
		guide: {
			fr: "   {pn} : Pour redémarrer le cœur du bot",
			en: "   {pn}: Restart bot"
		}
	},

	langs: {
		fr: {
			restarting: "🔄 𝗠𝗔𝗜𝗡𝗧𝗘𝗡𝗔𝗡𝗖𝗘 𝗘𝗡 𝗖𝗢𝗨𝗥𝗦... 🇨🇮\n\nLe système de Camille se relance. Attendez que la connexion se rétablisse.",
			success: "✅ 𝗦𝗬𝗦𝗧𝗘̀𝗠𝗘 𝗢𝗡𝗟𝗜𝗡𝗘\n\nRedémarrage effectué avec succès.\n⚡ Temps de réponse : %1s"
		}
	},

	onLoad: function ({ api }) {
		const pathDir = `${__dirname}/tmp`;
		const pathFile = `${pathDir}/restart.txt`;
		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			// On utilise un petit calcul simple pour le temps
			const timeDiff = ((Date.now() - time) / 1000).toFixed(2);
			
			// Message de retour après le reboot
			api.sendMessage(`✅ 𝗦𝗬𝗦𝗧𝗘̀𝗠𝗘 𝗢𝗡𝗟𝗜𝗡𝗘\n──────────────────\n🚀 Statut : Opérationnel\n⚡ Temps de boot : ${timeDiff}s\n\nLe Boss Camille est de retour.`, tid);
			fs.unlinkSync(pathFile);
		}
	},

	onStart: async function ({ message, event, getLang }) {
		const pathDir = `${__dirname}/tmp`;
		const pathFile = `${pathDir}/restart.txt`;
		
		// S'assurer que le dossier tmp existe
		if (!fs.existsSync(pathDir)) fs.mkdirSync(pathDir);
		
		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
		await message.reply(getLang("restarting"));
		
		// Sortie propre pour que le gestionnaire de processus (Render/PM2) relance
		process.exit(2);
	}
};
