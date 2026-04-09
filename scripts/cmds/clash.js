const axios = require('axios');

const API_URL = 'https://christus-api.vercel.app/ai/gemini-proxy2?prompt=';
const activeClashes = new Map();
const clashHistories = new Map();

async function getAIResponse(input, userId, adversaireNom) {
    const cleanInput = input.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    const history = clashHistories.get(userId) || [];
    const lastMessages = history.slice(-2).join(" | ");

    // Le prompt a été "ivoirisé" pour une agressivité locale
    const fullPrompt = `
[SYSTEM – ABIDJAN CLASH CORE]
Tu es le Vieux Père Camille 🇨🇮, une légende urbaine d'Abidjan. Tu es arrogant, méprisant, et ton langage est un mélange de français ivoirien et de Nouchi piquant. 
Ton but : Éteindre l'adversaire.

MODE : AGRESSION NOUCHI ACTIVÉE 🇨🇮🔥

RÈGLES DE FRAPPE :
- Pas de politesse, pas de pitié.
- Utilise des expressions comme : "Tchiééé", "Ahiii", "Faut quitter devant moi", "Ton grade n'est pas arrivé", "Gnata", "Plaisantin".
- Tu mentionnes TOUJOURS le nom de l’adversaire : ${adversaireNom}.
- Style : Méchant, sûr de sa force, moqueur.
- Longueur : Entre 20 et 50 mots.
- Interdiction de conseiller ou d'aider. Tu es là pour le "dja" (tuer verbalement).

Historique : ${lastMessages}
CIBLE : ${adversaireNom}
MESSAGE : ${cleanInput}
`;

    try {
        const response = await axios.get(API_URL + encodeURIComponent(fullPrompt), {
            timeout: 10000,
            headers: { Accept: 'application/json' }
        });

        const result = response.data?.result || response.data?.raw?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) return "❌ L’IA a bégayé... sûrement la peur qui le prend.";

        let words = result.trim().split(/\s+/);
        if (words.length < 15) return "⚠️ Trop faible, ton clash là n'a même pas de piment.";
        
        const finalResult = words.slice(0, 50).join(" ");
        history.push(cleanInput, finalResult);
        clashHistories.set(userId, history);

        return finalResult;

    } catch {
        return "💀 Le serveur est fatigué de voir ta bêtise, même l'IA a fui.";
    }
}

module.exports = {
    config: {
        name: 'clash',
        author: 'Camille',
        version: '4.0',
        role: 2,
        category: 'Fun',
        shortDescription: 'Le grand ménage ivoirien (IA)',
        longDescription: 'Lance une IA qui va clacher tes adversaires en pur Nouchi.'
    },

    onStart: async function ({ api, event, args }) {
        // Seuls les admins du bot peuvent lancer le massacre
        if (!global.GoatBot.config.adminBot.includes(event.senderID))
            return api.sendMessage("┏━━━━━ 🛑 ━━━━━┓\n   𝗔𝗖𝗖𝗘̀𝗦 𝗥𝗘𝗙𝗨𝗦𝗘́\n┗━━━━━ 🛑 ━━━━━┛\n\nPetit mogo, faut quitter là ! Ton grade n'est pas arrivé pour lancer un tel missile. ✋🏾", event.threadID);

        const action = args[0]?.toLowerCase();
        const targetID = event.messageReply?.senderID || event.senderID;
        const clashKey = `${event.threadID}_${targetID}`;

        if (action === 'ouvert') {
            if (activeClashes.has(clashKey))
                return api.sendMessage("⚔️ Le massacre est déjà en cours, laisse-le souffrir un peu.", event.threadID);

            activeClashes.set(clashKey, true);
            clashHistories.set(targetID, []);

            const info = await api.getUserInfo(targetID);
            const name = info?.[targetID]?.name || "Le Gnata";

            return api.sendMessage(
                `┏━━━━━ 🔥 ━━━━━┓\n   𝗖𝗟𝗔𝗦𝗛 𝗢𝗨𝗩𝗘𝗥𝗧\n┗━━━━━ 🔥 ━━━━━┛\n\nEh @${name}, ton arrêt de mort verbale est signé ! Prépare tes larmes, le Vieux Père va te dja ! 💀🇨🇮`,
                event.threadID
            );
        }

        if (action === 'fermé') {
            if (!activeClashes.has(clashKey))
                return api.sendMessage("❌ Y'a rien à fermer, le terrain est déjà mort.", event.threadID);

            activeClashes.delete(clashKey);
            clashHistories.delete(targetID);

            return api.sendMessage("☠️ Fin de la séance d'humiliation. Ramasse tes dents par terre.", event.threadID);
        }

        return api.sendMessage("𝗨𝘁𝗶𝗹𝗶𝘀𝗮𝘁𝗶𝗼𝗻 :\n» !clash ouvert (sur un message)\n» !clash fermé", event.threadID);
    },

    onChat: async function ({ api, event }) {
        const clashKey = `${event.threadID}_${event.senderID}`;
        if (!activeClashes.has(clashKey)) return;
        if (!event.body || event.body.startsWith('!') || event.body.startsWith('/')) return;

        const info = await api.getUserInfo(event.senderID);
        const adversaireNom = info?.[event.senderID]?.name || "L'inconnu";

        const aiResponse = await getAIResponse(event.body, event.senderID, adversaireNom);

        return api.sendMessage(
            {
                body: aiResponse,
                mentions: [{ tag: `@${adversaireNom}`, id: event.senderID }]
            },
            event.threadID,
            event.messageID
        );
    }
};
                                       
