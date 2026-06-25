const { getTime } = global.utils;

module.exports = {
    config: {
        name: "gc",
        aliases: ["group", "box", "groupmanage"],
        version: "1.5",
        author: "Chitron Bhattacharjee",
        editor: "Camille Uchiha 🌸",
        countDown: 5,
        role: 0,
        description: {
            en: "🌸 Gestion mignonne des groupes~ Trouve, ban, unban, info ✨"
        },
        category: "owner",
        guide: {
            en: `🌸 GUIDE MINI GC ✨
{pn} find <nom> → Cherche groupe par nom 🔍
{pn} find -j <nom> → Cherche groupes où bot est encore 💙
{pn} ban [tid] <raison> → Ban groupe mignon 🫥
{pn} unban [tid] → Unban groupe 🫶
{pn} info [tid] → Infos groupe détaillées 📊`
        }
    },

    langs: {
        en: {
            noPermission: "🌸 Aïe~ Seuls les admins bot peuvent gérer les groupes 🥺",
            found: "🌸🔍 TROUVÉ %1 GROUPE(S) KAWAI 🔍🌸\nMot clé: \"%2\"\n%3\n╰─ Tape l'ID pour plus d'infos~",
            notFound: "❌ Désolé~ Aucun groupe trouvé avec: \"%1\" 🥺\nVérifie l'orthographe~",
            hasBanned: "🌸⚠️ Ce groupe est déjà ban~ 🫥\nID: [%1 | %2]\n» Raison: %3\n» Date: %4",
            banned: "🌸✨ Groupe ban avec succès! ✨🌸\nID: [%1 | %2]\n» Raison: %3\n» Date: %4\nLe groupe peut plus utiliser le bot~ 🫡",
            notBanned: "🌸💙 Ce groupe est clean~ ID [%1 | %2] pas ban~ Il peut utiliser le bot normalement~ ✨",
            unbanned: "🌸✨ Groupe unban! ✨🌸\nID: [%1 | %2] peut réutiliser le bot maintenant~ Bienvenue de retour~ 🫶",
            missingReason: "🌸 Aïe~ Mets une raison de ban stp 🥺 Ex: gc ban 123 spam",
            info: `🌸📊 INFOS GROUPE KAWAI 📊🌸
» Box ID: %1 🆔
» Nom: %2 ✨
» Créé le: %3 📅
» Total membres: %4 👥
» Garçons: %5 💙
» Filles: %6 💗
» Total msgs: %7 💬%8
╰─ Groupe mignon détecté~ 🫶`
        },
        vi: {
            noPermission: "🌸 Aïe~ Chỉ admin bot mới dùng được 🥺",
            found: "🌸🔍 TÌM THẤY %1 NHÓM KAWAI 🔍🌸\nTừ khóa: \"%2\"\n%3\n╰─ Nhập ID để xem chi tiết~",
            notFound: "❌ Không tìm thấy nhóm nào: \"%1\" 🥺",
            hasBanned: "🌸⚠️ Nhóm đã bị ban rồi~ 🫥\nID: [%1 | %2]\n» Lý do: %3\n» Thời gian: %4",
            banned: "🌸✨ Đã ban nhóm thành công! ✨🌸\nID: [%1 | %2]\n» Lý do: %3\n» Thời gian: %4",
            notBanned: "🌸💙 Nhóm này sạch~ ID [%1 | %2] chưa bị ban~ ✨",
            unbanned: "🌸✨ Đã unban nhóm! ✨🌸\nID: [%1 | %2] dùng bot lại được~ 🫶",
            missingReason: "🌸 Aïe~ Nhập lý do ban đi 🥺",
            info: `🌸📊 THÔNG TIN NHÓM KAWAI 📊🌸
» Box ID: %1 🆔
» Tên: %2 ✨
» Tạo lúc: %3 📅
» Tổng member: %4 👥
» Nam: %5 💙
» Nữ: %6 💗
» Tổng tin nhắn: %7 💬%8
╰─ Nhóm dễ thương~ 🫶`
        }
    },

    onStart: async function ({ args, threadsData, message, role, event, getLang }) {
        const type = args[0];

        switch (type) {
            // find thread
            case "find":
            case "search":
            case "-f":
            case "-s": {
                if (role < 2)
                    return message.reply(getLang("noPermission"));
                let allThread = await threadsData.getAll();
                let keyword = args.slice(1).join(" ");
                if (['-j', '-join'].includes(args[1])) {
                    allThread = allThread.filter(thread => thread.members.some(member => member.userID == global.GoatBot.botID && member.inGroup));
                    keyword = args.slice(2).join(" ");
                }
                if (!keyword) return message.reply("🌸 Mets un nom à chercher stp~ Ex: gc find Hunter 🥺");

                const result = allThread.filter(item => item.threadID.length > 15 && (item.threadName || "").toLowerCase().includes(keyword.toLowerCase()));
                const resultText = result.reduce((i, thread) => i += `\n╭✨ Nom: ${thread.threadName}\n╰🆔 ID: ${thread.threadID}`, "");
                let msg = "";
                if (result.length > 0)
                    msg += getLang("found", result.length, keyword, resultText);
                else
                    msg += getLang("notFound", keyword);
                message.reply(msg);
                break;
            }

            // ban thread
            case "ban":
            case "-b": {
                if (role < 2)
                    return message.reply(getLang("noPermission"));
                let tid, reason;
                if (!isNaN(args[1])) {
                    tid = args[1];
                    reason = args.slice(2).join(" ");
                }
                else {
                    tid = event.threadID;
                    reason = args.slice(1).join(" ");
                }
                if (!tid)
                    return message.SyntaxError();
                if (!reason)
                    return message.reply(getLang("missingReason"));
                reason = reason.replace(/\s+/g, ' ');
                const threadData = await threadsData.get(tid);
                const name = threadData.threadName || "Groupe sans nom";
                const status = threadData.banned?.status;

                if (status)
                    return message.reply(getLang("hasBanned", tid, name, threadData.banned.reason, threadData.banned.date));
                const time = getTime("DD/MM/YYYY HH:mm:ss");
                await threadsData.set(tid, {
                    banned: {
                        status: true,
                        reason,
                        date: time
                    }
                });
                return message.reply(getLang("banned", tid, name, reason, time));
            }

            // unban thread
            case "unban":
            case "-u": {
                if (role < 2)
                    return message.reply(getLang("noPermission"));
                let tid;
                if (!isNaN(args[1]))
                    tid = args[1];
                else
                    tid = event.threadID;
                if (!tid)
                    return message.SyntaxError();

                const threadData = await threadsData.get(tid);
                const name = threadData.threadName || "Groupe sans nom";
                const status = threadData.banned?.status;

                if (!status)
                    return message.reply(getLang("notBanned", tid, name));
                await threadsData.set(tid, {
                    banned: {}
                });
                return message.reply(getLang("unbanned", tid, name));
            }

            // info thread
            case "info":
            case "-i": {
                let tid;
                if (!isNaN(args[1]))
                    tid = args[1];
                else
                    tid = event.threadID;
                if (!tid)
                    return message.SyntaxError();
                const threadData = await threadsData.get(tid);
                const createdDate = getTime(threadData.createdAt, "DD/MM/YYYY HH:mm:ss");
                const valuesMember = Object.values(threadData.members || {}).filter(item => item.inGroup);
                const totalBoy = valuesMember.filter(item => item.gender == "MALE").length;
                const totalGirl = valuesMember.filter(item => item.gender == "FEMALE").length;
                const totalMessage = valuesMember.reduce((i, item) => i += item.count || 0, 0);
                const infoBanned = threadData.banned?.status?
                    `\n- Ban: Oui 🫥\n- Raison: ${threadData.banned.reason}\n- Date: ${threadData.banned.date}` :
                    "\n- Ban: Non ✨";
                const msg = getLang("info", threadData.threadID, threadData.threadName || "Sans nom", createdDate, valuesMember.length, totalBoy, totalGirl, totalMessage, infoBanned);
                return message.reply(msg);
            }

            default:
                return message.SyntaxError();
        }
    }
};
