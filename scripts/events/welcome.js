const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "Camille ",
    category: "events"
  },

  onStart: async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const newUsers = logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    if (newUsers.some(u => u.userFbId === botID)) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName;
    const memberCount = threadInfo.participantIDs.length;

    for (const user of newUsers) {
      const userId = user.userFbId;
      const fullName = user.fullName;

      try {
        const timeStr = new Date().toLocaleString("fr-BE", { // Utilisation de la locale française
          timeZone: "Asia/Dhaka",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
          hour12: true,
        });

        // URL du GIF de bienvenue
        const gifUrl = 'https://i.ibb.co/mr49QsCW/image0.gif';  // Remplacez par votre propre GIF si nécessaire
        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);
        const gifPath = path.join(tmp, `welcome_${userId}.gif`);

        // Télécharger le GIF
        const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(gifPath, response.data);

        // Envoyer le message de bienvenue avec le GIF comme pièce jointe
        await api.sendMessage({
          body:
            `  ${fullName} ! \n\n` +
            `Bienvenue dans le groupe ${groupName} ! Nous sommes ravis de t'accueillir parmi nous. \n\n` +
            `Tu es maintenant le ${memberCount}e membre du groupe, alors profite bien de l'aventure et n'hésite pas à participer ! \n\n` +
            ` Heure actuelle : ${timeStr}\n\n` +
            `Amuse-toi bien ! `,
          attachment: fs.createReadStream(gifPath),
          mentions: [{ tag: fullName, id: userId }]
        }, threadID);

        // Ne pas supprimer le GIF

      } catch (err) {
        console.error("❌ Erreur lors de l'envoi du message de bienvenue:", err);
      }
    }
  }
};
