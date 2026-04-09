module.exports = {
	config: {
		name: "kick",
		version: "1.4",
		author: "Camille-Dev 🩵",
		countDown: 5,
		role: 1,
		description: {
			fr: "Dégager un mogo du quartier (Kick)",
			en: "Kick member out of chat box"
		},
		category: "administration",
		guide: {
			fr: "   {pn} @tag : pour chasser ceux qui sont tagués\n   Ou réponds à un message avec {pn}",
			en: "   {pn} @tags: use to kick members who are tagged"
		}
	},

	langs: {
		fr: {
			needAdmin: "⚠️ Ahiii ! Il faut me donner les clés du quartier (Admin) pour que je puisse chasser les gens.",
			kicked: "🧹 𝗡𝗘𝗧𝗧𝗢𝗬𝗔𝗚𝗘 𝗘𝗙𝗙𝗘𝗖𝗧𝗨𝗘́ 🇨🇮\n\nLe civil a été reconduit à la frontière. On ne s'amuse pas ici !"
		}
	},

	onStart: async function ({ message, event, args, threadsData, api, getLang }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		
		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));

		async function kickAndCheckError(uid) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
				return "SUCCESS";
			}
			catch (e) {
				message.reply(getLang("needAdmin"));
				return "ERROR";
			}
		}

		if (!args[0]) {
			if (!event.messageReply)
				return message.SyntaxError();
			
			const res = await kickAndCheckError(event.messageReply.senderID);
			if (res === "SUCCESS") message.reply(getLang("kicked"));
		}
		else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.SyntaxError();

			// On essaie le premier, si ça marche, on enchaîne
			if (await kickAndCheckError(uids.shift()) === "ERROR") return;
			
			for (const uid of uids) {
				api.removeUserFromGroup(uid, event.threadID);
			}
			message.reply(getLang("kicked"));
		}
	}
};
				
