const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ownerInfo = {
  name: "ʚʆɞ Camille Uchiha ʚʆɞ",
  facebook: "https://www.facebook.com/profile.php?id=61577875842514",
  telegram: "🌸 Camille Uchiha",
  supportGroup: "🎀 Kawaii Support GC 🎀"
};

const editorInfo = {
  name: "🎀 Mini Kawaii Editor 🎀",
  note: "Made with love & anime vibes 💖✨"
};

module.exports = {
  config: {
    name: "botjoin",
    version: "2.0",
    author: "Saimx69x",
    editor: "Camille",
    category: "events"
  },

  onStart: async function ({ event, api }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const botID = api.getCurrentUserID();
    const addedUsers = logMessageData.addedParticipants;

    const isBotAdded = addedUsers.some(u => u.userFbId === botID);
    if (!isBotAdded) return;

    const nickNameBot = global.GoatBot.config.nickNameBot || "🎀 Sakura Chan Bot 🎀";
    const prefix = global.utils.getPrefix(threadID);

    try {
      await api.changeNickname(nickNameBot, threadID, botID);
    } catch (err) {
      console.warn("⚠️ Nickname change failed:", err.message);
    }

    try {
      const API_ENDPOINT = "https://xsaim8x-xxx-api.onrender.com/api/botjoin";
      const apiUrl = `${API_ENDPOINT}?botuid=${botID}&prefix=${encodeURIComponent(prefix)}`;

      const tmpDir = path.join(__dirname, "..", "cache");
      await fs.ensureDir(tmpDir);
      const imagePath = path.join(tmpDir, `botjoin_${threadID}.png`);

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, response.data);

      const textMsg = [
        "🎀 𝐵𝑜𝑡 𝐽𝑜𝑖𝑛𝑒𝑑 ~ 𝐾𝑎𝑤𝑎𝑖𝑖 𝑀𝑜𝑑𝑒 🎀",
        "",
        `💠 𝐏𝐫𝐞𝐟𝐢𝐱 : ${prefix}`,
        `✨ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 : ${prefix}help`,
        "",
        "━━━━━━━━━━ ✧ ✦ ✧ ━━━━━━━━━━",
        `👑 𝐎𝐰𝐧𝐞𝐫 : ${ownerInfo.name}`,
        `🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : ${ownerInfo.facebook}`,
        `✈️ 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 : ${ownerInfo.telegram}`,
        `💬 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 : ${ownerInfo.supportGroup}`,
        "",
        `🖊️ 𝐄𝐝𝐢𝐭𝐨𝐫 : ${editorInfo.name}`,
        `💖 ${editorInfo.note}`,
        "━━━━━━━━━━ ✧ ✦ ✧ ━━━━━━━━━━"
      ].join("\n");

      await api.sendMessage({
        body: textMsg,
        attachment: fs.createReadStream(imagePath)
      }, threadID);

      fs.unlinkSync(imagePath);

    } catch (err) {
      console.error("⚠️ Error sending botjoin message:", err);

      const fallbackMsg = [
        "🎀 𝐵𝑜𝑡 𝐽𝑜𝑖𝑛𝑒𝑑 🎀",
        "",
        `💠 𝐏𝐫𝐞𝐟𝐢𝐱 : ${prefix}`,
        "",
        `👑 𝐎𝐰𝐧𝐞𝐫 : ${ownerInfo.name}`,
        `🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : ${ownerInfo.facebook}`,
        `💬 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 : ${ownerInfo.supportGroup}`
      ].join("\n");

      api.sendMessage(fallbackMsg, threadID);
    }
  }
};
