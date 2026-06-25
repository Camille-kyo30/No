const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "callad",
	version: "1.8",
	author: "Camille Uchiha 🌸",
		countDown: 5,
	role: 0,
		description: {
			vi: "gửi báo cáo, góp ý, báo lỗi,... của bạn về admin bot",
			en: "🌸 Envoyer rapport, suggestion, bug au boss admin~ 🫶"
	},
		category: "admin",
	guide: {
			vi: " {pn} <tin nhắn>",
			en: `╭─🌸⋅✧₊˚.GUIDE.˚₊✧⋅🌸─╮\n│\n│ ✨ {pn} <message>\n│\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
	}
	},

	langs: {
	vi: {
			session1: "🌅 buổi sáng",
			session2: "☀️ buổi trưa",
			session3: "🌇 buổi chiều",
			session4: "🌙 buổi tối",
			missingMessage: "🌸💔 Aïe~ Écris ton message stp~ 🥺",
			sendByGroup: "\n- 📦 Envoyé depuis: %1\n- 🆔 Thread ID: %2",
			sendByUser: "\n- 👤 Envoyé en privé",
			content: "\n\n🌸 Contenu du message:\n─────────────────\n%1\n─────────────────\n💙 Réponds à ce msg pour répondre au Hunter",
			success: "🌸✨ Envoyé aux boss admin avec succès! ✨🌸\n%2\n🫶 Ils vont te répondre vite~",
			failed: "🌸💔 Erreur lors de l'envoi aux boss admin\n%2\n📝 Vérifie la console stp",
			reply: "🌸💙 Réponse du boss %1:\n─────────────────\n%2\n─────────────────\n💙 Réponds à ce msg pour continuer",
			replySuccess: "🌸✨ Ta réponse a été envoyée aux boss~ 🫶",
			feedback: "🌸✎ Feedback du Hunter %1:\n- 🆔 User ID: %2%3\n🌸 Contenu:\n─────────────────\n%4\n─────────────────\n💙 Réponds à ce msg pour répondre",
			replyUserSuccess: "🌸✨ Réponse envoyée au Hunter avec succès~ 🫶",
			noAdmin: "🌸💔 Aïe~ Aucun boss admin configuré pour l'instant 🥺"
	},
	en: {
			missingMessage: "🌸💔 Aïe~ Please write your message stp~ 🥺",
			sendByGroup: "\n- 📦 Sent from group: %1\n- 🆔 Thread ID: %2",
			sendByUser: "\n- 👤 Sent from user",
			content: "\n\n🌸 Content:\n─────────────────\n%1\n─────────────────\n💙 Reply this message to send message to user",
			success: "🌸✨ Sent your message to %1 boss admin successfully! ✨🌸\n%2\n🫶 They will reply soon~",
			failed: "🌸💔 An error occurred while sending to %1 boss admin\n%2\n📝 Check console for details",
			reply: "🌸💙 Reply from boss %1:\n─────────────────\n%2\n─────────────────\n💙 Reply this message to continue send to admin",
			replySuccess: "🌸✨ Sent your reply to boss admin successfully! 🫶",
			feedback: "🌸✎ Feedback from user %1:\n- 🆔 User ID: %2%3\n🌸 Content:\n─────────────────\n%4\n─────────────────\n💙 Reply this message to send to user",
			replyUserSuccess: "🌸✨ Sent your reply to user successfully! 🫶",
			noAdmin: "🌸💔 Aïe~ Bot has no boss admin at the moment 🥺"
	}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		const { config } = global.GoatBot;
		if (!args[0])
			return message.reply(getLang("missingMessage"));
		const { senderID, threadID, isGroup } = event;
		if (config.adminBot.length == 0)
			return message.reply(getLang("noAdmin"));
		const senderName = await usersData.getName(senderID);
		const msg = `🌸✨ 𝑪𝑨𝑳 𝑨𝑫𝑴𝑰𝑵 𝑲𝑨𝑾𝑨𝑰 ✨🌸
- 👤 Hunter: ${senderName}
- 🆔 User ID: ${senderID}`
			+ (isGroup? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));

		const formMessage = {
			body: msg + getLang("content", args.join(" ")),
			mentions: [{
				id: senderID,
				tag: senderName
			}],
			attachment: await getStreamsFromAttachment(
				[...event.attachments,...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
	};

		const successIDs = [];
		const failedIDs = [];
		const adminNames = await Promise.all(config.adminBot.map(async item => ({
			id: item,
			name: await usersData.getName(item)
	})));

		for (const uid of config.adminBot) {
			try {
				const messageSend = await api.sendMessage(formMessage, uid);
				successIDs.push(uid);
				global.GoatBot.onReply.set(messageSend.messageID, {
					commandName,
					messageID: messageSend.messageID,
					threadID,
					messageIDSender: event.messageID,
					type: "userCallAdmin"
				});
			}
			catch (err) {
				failedIDs.push({
					adminID: uid,
					error: err
				});
			}
	}

		let msg2 = "";
		if (successIDs.length > 0)
			msg2 += getLang("success", successIDs.length,
				adminNames.filter(item => successIDs.includes(item.id)).map(item => ` 🌸@${item.id} (${item.name})`).join("\n")
			);
		if (failedIDs.length > 0) {
			msg2 += getLang("failed", failedIDs.length,
				failedIDs.map(item => ` 🌸@${item.adminID} (${adminNames.find(item2 => item2.id == item.adminID)?.name || item.adminID})`).join("\n")
			);
			log.err("CALL ADMIN", failedIDs);
	}
		return message.reply({
			body: msg2,
			mentions: adminNames.map(item => ({
				id: item.id,
				tag: item.name
			}))
	});
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;

		switch (type) {
			case "userCallAdmin": {
				const formMessage = {
					body: getLang("reply", senderName, args.join(" ")),
					mentions: [{
						id: event.senderID,
						tag: senderName
					}],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err)
						return message.err(err);
					message.reply(getLang("replyUserSuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "adminReply"
					});
				}, messageIDSender);
				break;
			}
			case "adminReply": {
				let sendByGroup = "";
				if (isGroup) {
					const { threadName } = await api.getThreadInfo(event.threadID);
					sendByGroup = getLang("sendByGroup", threadName, event.threadID);
				}
				const formMessage = {
					body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
					mentions: [{
						id: event.senderID,
						tag: senderName
					}],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err)
						return message.err(err);
					message.reply(getLang("replySuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "userCallAdmin"
					});
				}, messageIDSender);
				break;
			}
			default: {
				break;
			}
	}
	}
};
