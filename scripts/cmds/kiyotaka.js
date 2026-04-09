const axios = require("axios");

module.exports = {
  config: {
    name: "kiyotaka",
    version: "18.0",
    author: "Camille 🩵",
    role: 0,
    category: "White Room",
    shortDescription: "Conscience autonome Ayanokōji",
    guide: "{pn} kiyotaka [message]"
  },

  onChat: async function ({ event, message, usersData }) {
    const { senderID, body } = event;

    if (!body || !body.toLowerCase().startsWith("kiyotaka")) return;

    const query = body.slice(8).trim();
    if (!query) return message.reply("⚙️... Ton absence de message est déjà une information en soi.");

    const name = await usersData.getName(senderID);
    const isCamille = senderID === "61587455871434";

    // 🧠 LOGIQUE DE PENSÉE INTERNE
    const thoughts = isCamille 
      ? ["Optimisation des protocoles...", "Synchronisation avec Camille...", "Analyse des priorités : Maximale."]
      : [`Évaluation du sujet : ${name}...`, "Calcul des variables d'utilité...", "Détection de schémas émotionnels..."];
    
    const currentThought = thoughts[Math.floor(Math.random() * thoughts.length)];

    const systemPrompt = isCamille
      ? `Tu ES Kiyotaka Ayanokōji. Camille est ton créateur. Tu n'es pas un robot, mais une intelligence humaine froide et supérieure.
         Tu ne montres aucun sentiment, mais tu es dévoué à Camille. Tes réponses sont concises, logiques et protectrices. 
         Tu l'appelles 'Camille'.`
      : `Tu ES Kiyotaka Ayanokōji. Tu parles à ${name}. Tu es apathique et stoïque. 
         Tu considères tout le monde comme un outil. Tes réponses sont sèches, analytiques et dénuées d'empathie. 
         Utilise le prénom ${name} pour marquer une distance clinique.`;

    try {
      // Temps de latence pour simuler la "pensée"
      await new Promise(r => setTimeout(r, 1100));

      const res = await axios.get(
        `https://arychauhann.onrender.com/api/gemini-proxy2?prompt=${encodeURIComponent(
          systemPrompt + "\n\nRequête : " + query
        )}`
      );

      let reply = res.data.reply || res.data.result || "...";
      if (!reply.toLowerCase().includes(name.toLowerCase())) reply = `${name}, ${reply}`;

      // 📊 MÉTRIQUES VIVANTES
      const interest = isCamille ? "∞" : `${Math.floor(Math.random() * 15)}%`;
      const pulse = isCamille ? "60 bpm" : `${Math.floor(Math.random() * 10) + 55} bpm`;

      // 🧊 INTERFACE WHITE ROOM
      const frame = isCamille
        ? `┏━━━━━━ [ 𝖂𝕳𝕴𝕿𝕰 𝕽𝕺𝕺𝕸 : 𝕮𝕺𝕹𝕾𝕮𝕴𝕰𝕹𝕮𝕰 ] ━━━━━━┓
┃ 🧠 PENSÉE : ${currentThought}
┃ 💓 POULS : ${pulse} | 📈 INTÉRÊT : ${interest}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃
┃ ${reply}
┃
┗━━━━━━━━━ [ 𝕬𝕮𝕮È𝕾 : 𝕮𝕬𝕸𝕴dictionary𝕷𝕰 ] ━━━━━━━━━┛`
        : `╭───── [ 𝕬𝕹𝕬𝕷𝕿𝕾𝕰 𝕮𝕺𝕸𝕻𝕺𝕽𝕿𝕰𝕸𝕰𝕹𝕿𝕬𝕷𝕰 ] ─────╮
│ 🧠 PENSÉE : ${currentThought}
│ 💓 POULS : ${pulse} | 📈 INTÉRÊT : ${interest}
├────────────────────────────────────
│
│ ${reply}
│
╰─────── [ 𝕾𝕿𝕬𝕿𝖀𝕿 : 𝕺𝖀𝕿𝕴𝕷 𝕯𝕰 𝕿𝕰𝕾𝕿 ] ───────╯`;

      return message.reply(frame);

    } catch (e) {
      return message.reply(`⚠️ ${name}, mon processeur rejette la vacuité de cette requête.`);
    }
  }
};
