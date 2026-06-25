const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "money", "tk", "coin", "cash"],
        version: "1.8",
        author: "Chitron Bhattacharjee",
        editor: "Camille Uchiha 🌸",
        countDown: 3,
        role: 0,
        shortDescription: {
            en: "🌸 Check ton argent kawaii avec card mignonne ✨"
        },
        longDescription: {
            en: "Affiche ton solde ou celui d'un Hunter en style anime kawaii + image personnalisée 💙"
        },
        category: "💼 Economy",
        guide: {
            en: `🌸 GUIDE MINI BAL ✨
+bal → Voir ton argent
+bal @tag → Voir argent d'un Hunter
+bal <uid> → Voir par ID [admin only]`
        },
        usePrefix: true,
        useChat: true,
    },

    onStart: async function ({ event, args, message, usersData, api, role }) {
        let targetID = event.senderID;

        if (args.length > 0) {
            if (event.mentions && Object.keys(event.mentions).length > 0) {
                targetID = Object.keys(event.mentions)[0];
            } else if (/^\d{5,20}$/.test(args[0])) {
                if (role === 2) targetID = args[0];
                else return message.reply("🌸🔒 Aïe~ Seul le boss peut voir l'argent des autres 🥺");
            }
        }

        const name = await usersData.getName(targetID) || "Hunter Mystère";
        const balance = (await usersData.get(targetID, "money")) || 0;

        // Text reply mignon
        const replyText =
`🌸✨ 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗞𝗔𝗪𝗔𝗜 ✨🌸
━━━━━━━━━━━━━━━
💙 Hunter: ${name}
🆔 ID: ${targetID}
💰 Argent: ＄${balance.toLocaleString()} 💸
━━━━━━━━━━━━━━━
✨ Reste mignon et riche~ 🫶`;

        await message.reply(replyText);

        try {
            let avatarURL = await usersData.getAvatarUrl(targetID);
            if (!avatarURL) avatarURL = "https://i.imgur.com/4NZ6uLY.jpg";

            const width = 450;
            const height = 200;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");

            // Background gradient kawaii pink -> purple
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, "#FFB6E6");
            gradient.addColorStop(0.5, "#FF69B4");
            gradient.addColorStop(1, "#D580FF");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Bordure mignonne
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, width-4, height-4);

            const avatarResp = await axios.get(avatarURL, { responseType: "arraybuffer" });
            const avatarImg = await loadImage(Buffer.from(avatarResp.data, "binary"));

            const avatarSize = 130;
            const avatarX = 25;
            const avatarY = (height - avatarSize) / 2;

            // Avatar cercle avec ombre kawaii
            ctx.save();
            ctx.shadowColor = "rgba(0,0,0,0.3)";
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();

            // Bordure avatar blanche épaisse
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#FFFFFF";
            ctx.stroke();

            // Couleurs mignonnes
            const nameColors = ["#FF1493", "#FF69B4", "#C71585", "#FF00FF"];
            const balanceColors = ["#32CD32", "#00CED1", "#FFD700", "#FF6347", "#ADFF2F"];

            const baseY = avatarY + avatarSize / 2 - 35;

            // Nom avec couleur aléatoire kawaii
            ctx.font = "bold 26px 'Segoe UI', Arial";
            ctx.fillStyle = nameColors[Math.floor(Math.random() * nameColors.length)];
            ctx.textAlign = "left";
            ctx.shadowColor = "rgba(0,0,0,0.2)";
            ctx.shadowBlur = 3;
            ctx.fillText(name, avatarX + avatarSize + 25, baseY);

            // ID en blanc
            ctx.shadowBlur = 0;
            ctx.font = "18px 'Segoe UI'";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(`🆔 ${targetID}`, avatarX + avatarSize + 25, baseY + 32);

            // Label Balance
            ctx.font = "bold 22px 'Segoe UI'";
            ctx.fillStyle = "#FFF0F5";
            ctx.fillText("💰 Balance:", avatarX + avatarSize + 25, baseY + 65);

            // Montant avec couleur aléatoire + sparkle
            const balanceText = `＄${balance.toLocaleString()}`;
            ctx.font = "bold 28px 'Segoe UI'";
            ctx.fillStyle = balanceColors[Math.floor(Math.random() * balanceColors.length)];
            ctx.fillText(balanceText, avatarX + avatarSize + 25, baseY + 100);

            // Emojis sparkle kawaii
            ctx.font = "45px Arial";
            ctx.fillStyle = "#FFF";
            ctx.fillText("✨", width - 55, 45);
            ctx.fillText("🌸", width - 75, 100);
            ctx.fillText("💎", width - 55, 155);
            ctx.fillText("🫶", 10, height - 10);

            // Save image
            const imgBuffer = canvas.toBuffer("image/png");
            const imgPath = path.join(__dirname, "cache", `balance_${targetID}.png`);

            await fs.ensureDir(path.dirname(imgPath));
            await fs.writeFile(imgPath, imgBuffer);

            api.sendMessage(
                {
                    body: `🌸✨ Voici ta carte de balance kawaii! 💙\nReste riche Hunter~ 🫶`,
                    attachment: fs.createReadStream(imgPath),
                },
                event.threadID
            );

            // Delete après 10s pour clean
            setTimeout(() => fs.unlink(imgPath).catch(() => {}), 10000);
        } catch (err) {
            console.error("Balance image error:", err);
            message.reply("🌸 Aïe~ Erreur génération image~ Mais ton argent est safe 💙");
        }
    },

    onChat: async function ({ event, message }) {
        const body = event.body?.toLowerCase();
        if (!body) return;

        if (["bal", "balance", "money", "tk", "coin", "cash"].includes(body.trim())) {
            return this.onStart({ event, message, args: [], usersData: global.GoatBot.usersData, api: global.GoatBot.api, role: 0 });
        } else if (body.startsWith("bal ")) {
            const args = body.trim().split(/\s+/).slice(1);
            return this.onStart({ event, message, args, usersData: global.GoatBot.usersData, api: global.GoatBot.api, role: 0 });
        }
    },
};
