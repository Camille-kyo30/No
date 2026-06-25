const axios = require('axios');
const validUrl = require('valid-url');
const fs = require('fs');
const path = require('path');
const ytSearch = require('yt-search');
const { v4: uuidv4 } = require('uuid');

const API_ENDPOINT = "https://shizuai.vercel.app/chat";
const CLEAR_ENDPOINT = "https://shizuai.vercel.app/chat/clear";
const YT_API = "http://65.109.80.126:20409/aryan/yx";
const EDIT_API = "https://gemini-edit-omega.vercel.app/edit";

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// 📥 Téléchargement de fichier
const downloadFile = async (url, ext) => {
  const filePath = path.join(TMP_DIR, `${uuidv4()}.${ext}`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, Buffer.from(response.data));
  return filePath;
};

// ♻️ Réinitialiser la conversation
const resetConversation = async (api, event, message) => {
  api.setMessageReaction("🌸", event.messageID, () => {}, true);
  try {
    await axios.delete(`${CLEAR_ENDPOINT}/${event.senderID}`);
    return message.reply(`╭─🌸⋅✧₊˚.RESET.˚₊✧⋅🌸─╮\n│\n│ ✨ Conversation reset~ 🫶\n│ 🆔 UID: ${event.senderID}\n│ 💙 On recommence à zéro~\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
  } catch (error) {
    console.error('❌ Reset Error:', error.message);
    return message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Reset failed stp 🥺\n│ 📝 Try again~ 💙\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
  }
};

// 🎨 Fonction Edit Gemini-Edit
const handleEdit = async (api, event, message, args) => {
  const prompt = args.join(" ");
  if (!prompt) return message.reply(`╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Écris ton prompt stp~ 🥺\n│ ✨ Ex: edit un chat kawaii\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);

  api.setMessageReaction("⏳", event.messageID, () => {}, true);
  try {
    const params = { prompt };
    if (event.messageReply?.attachments?.[0]?.url) {
      params.imgurl = event.messageReply.attachments[0].url;
    }

    const res = await axios.get(EDIT_API, { params });

    if (!res.data?.images?.[0]) {
      api.setMessageReaction("🌸💔", event.messageID, () => {}, true);
      return message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Failed to generate/edit 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
    }

    const base64Image = res.data.images[0].replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");

    const imagePath = path.join(TMP_DIR, `${Date.now()}.png`);
    fs.writeFileSync(imagePath, buffer);

    api.setMessageReaction("🌸✨", event.messageID, () => {}, true);
    await message.reply({
      body: `╭─🌸⋅✧₊˚.EDIT SUCCESS.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ Image générée~ 🫶\n│ 💙 Voilà ton edit~ ✨\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
      attachment: fs.createReadStream(imagePath)
    });
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error("❌ EDIT API Error:", error.response?.data || error.message);
    api.setMessageReaction("🌸💔", event.messageID, () => {}, true);
    return message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Error while editing~ 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
  }
};

// 🎬 Fonction YouTube
const handleYouTube = async (api, event, message, args) => {
  const option = args[0];
  if (!["-v", "-a"].includes(option)) {
    return message.reply(`╭─🌸⋅✧₊˚.GUIDE YT.˚₊✧⋅🌸─╮\n│\n│ ✨ Usage: ai yt -v <url>\n│ ✨ Usage: ai yt -a <url>\n│ 💙 -v = video | -a = audio\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
  }

  const query = args.slice(1).join(" ");
  if (!query) return message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Mets une URL stp~ 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);

  const sendFile = async (url, type) => {
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const { data } = await axios.get(`${YT_API}?url=${encodeURIComponent(url)}&type=${type}`);
      const downloadUrl = data.download_url;
      if (!data.status ||!downloadUrl) throw new Error("API failed");
      const filePath = path.join(TMP_DIR, `yt_${Date.now()}.${type}`);
      const writer = fs.createWriteStream(filePath);
      const stream = await axios({ url: downloadUrl, responseType: "stream" });
      stream.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      api.setMessageReaction("🌸✨", event.messageID, () => {}, true);
      await message.reply({
        body: `╭─🌸⋅✧₊˚.DOWNLOAD.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ ${type == 'mp4'? 'Video' : 'Audio'} prêt~ 🫶\n│ 💙 Profite bien~ ✨\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
        attachment: fs.createReadStream(filePath)
      });
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`${type} error:`, err.message);
      api.setMessageReaction("🌸💔", event.messageID, () => {}, true);
      message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Failed download ${type} 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
    }
  };

  if (query.startsWith("http")) return await sendFile(query, option === "-v"? "mp4" : "mp3");

  try {
    api.setMessageReaction("🔍", event.messageID, () => {}, true);
    const results = (await ytSearch(query)).videos.slice(0, 6);
    if (results.length === 0) return message.reply(`╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 No results found 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);

    let list = `╭─🌸⋅✧₊˚.RÉSULTATS YT.˚₊✧⋅🌸─╮\n│\n`;
    results.forEach((v, i) => {
      list += `│ ${i + 1}. 🎬 ${v.title} (${v.timestamp})\n`;
    });
    list += `│\n│ 💙 Réponds avec 1-6 pour download\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`;

    const thumbs = await Promise.all(
      results.map(v => axios.get(v.thumbnail, { responseType: "stream" }).then(res => res.data))
    );

    api.sendMessage(
      { body: list, attachment: thumbs },
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "ai",
          messageID: info.messageID,
          author: event.senderID,
          results,
          type: option
        });
      },
      event.messageID
    );
  } catch (err) {
    console.error("YouTube error:", err.message);
    api.setMessageReaction("🌸💔", event.messageID, () => {}, true);
    message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Failed search YT 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
  }
};

// 🧠 Fonction IA principale
const handleAIRequest = async (api, event, userInput, message, isReply = false) => {
  const args = userInput.split(" ");
  const first = args[0]?.toLowerCase();

  if (["edit", "-e"].includes(first)) {
    return await handleEdit(api, event, message, args.slice(1));
  }

  if (["youtube", "yt", "ytb"].includes(first)) {
    return await handleYouTube(api, event, message, args.slice(1));
  }

  const userId = event.senderID;
  let messageContent = userInput;
  let imageUrl = null;

  api.setMessageReaction("🌸⏳", event.messageID, () => {}, true);

  const urlMatch = messageContent.match(/(https?:\/\/[^\s]+)/)?.[0];
  if (urlMatch && validUrl.isWebUri(urlMatch)) {
    imageUrl = urlMatch;
    messageContent = messageContent.replace(urlMatch, '').trim();
  }

  if (!messageContent &&!imageUrl) {
    api.setMessageReaction("🌸💔", event.messageID, () => {}, true);
    return message.reply(`╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Écris un message stp~ 🥺\n│ 💙 Ou envoie une image\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
  }

  try {
    const response = await axios.post(API_ENDPOINT, { uid: userId, message: messageContent, image_url: imageUrl });
    const { reply: textReply, image_url: genImageUrl } = response.data;

    let finalReply = textReply || '🌸✨ Réponse AI:';
    finalReply = finalReply
     .replace(/🎀\s*𝗦𝗵𝗶𝘇𝘂/gi, '🎀 𝗖𝗵𝗿𝗶𝘀𝘁𝘂𝘀')
     .replace(/Shizu/gi, 'Christus')
     .replace(/Christuska/gi, 'Christus')
     .replace(/Aryan Chauhan/gi, 'Christus');

    const attachments = [];
    if (genImageUrl) {
      attachments.push(fs.createReadStream(await downloadFile(genImageUrl, 'jpg')));
    }

    const sentMessage = await message.reply({
      body: `╭─🌸⋅✧₊˚.CHRISTUS AI.˚₊✧⋅🌸─╮\n│\n│ ${finalReply}\n│\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
      attachment: attachments.length > 0? attachments : undefined
    });

    global.GoatBot.onReply.set(sentMessage.messageID, {
      commandName: 'ai',
      messageID: sentMessage.messageID,
      author: userId
    });

    api.setMessageReaction("🌸✨", event.messageID, () => {}, true);
  } catch (error) {
    console.error("❌ API Error:", error.message);
    api.setMessageReaction("🌸💔", event.messageID, () => {}, true);
    message.reply(`╭─🌸⋅✧₊˚.ERREUR AI.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 AI Error: ${error.message}\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
  }
};

module.exports = {
  config: {
    name: 'ai',
    version: '3.3.0',
    author: 'Christus',
    editor: 'Camille Uchiha 🌸',
    role: 0,
    category: 'ai',
    longDescription: { en: '🌸 AI Kawaii + YouTube + Edit: Chat, Images, Music, Video 🫶' },
    guide: {
      en: `╭─🌸⋅✧₊˚.GUIDE AI.˚₊✧⋅🌸─╮
│
│ ✨ ai <message> → chat avec AI 💙
│ 🎨 ai edit <prompt> → génère/edit image
│ 🎬 ai yt -v <url> → download video
│ 🎵 ai yt -a <url> → download audio
│ ♻️ ai clear → reset conversation
│
╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const userInput = args.join(' ').trim();
    if (!userInput) return message.reply(`╭─🌸⋅✧₊˚.INFO.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Écris un message stp~ 🥺\n│ ✨ Ex: ai salut comment ça va\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
    if (['clear', 'reset'].includes(userInput.toLowerCase())) {
      return await resetConversation(api, event, message);
    }
    return await handleAIRequest(api, event, userInput, message);
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID!== Reply.author) return;
    const userInput = event.body?.trim();
    if (!userInput) return;
    if (['clear', 'reset'].includes(userInput.toLowerCase())) {
      return await resetConversation(api, event, message);
    }
    if (Reply.results && Reply.type) {
      const idx = parseInt(userInput);
      const list = Reply.results;
      if (isNaN(idx) || idx < 1 || idx > list.length)
        return message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Choix invalide 1-6 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
      const selected = list[idx - 1];
      const type = Reply.type === "-v"? "mp4" : "mp3";
      const fileUrl = `${YT_API}?url=${encodeURIComponent(selected.url)}&type=${type}`;
      try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);
        const { data } = await axios.get(fileUrl);
        const downloadUrl = data.download_url;
        const filePath = await downloadFile(downloadUrl, type);
        api.setMessageReaction("🌸✨", event.messageID, () => {}, true);
        await message.reply({ attachment: fs.createReadStream(filePath) });
        fs.unlinkSync(filePath);
      } catch {
        api.setMessageReaction("🌸💔", event.messageID, () => {}, true);
        message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Failed download ${type} 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
      }
    } else {
      return await handleAIRequest(api, event, userInput, message, true);
    }
  },

  onChat: async function ({ api, event, message }) {
    const body = event.body?.trim();
    if (!body?.toLowerCase().startsWith('ai ')) return;
    const userInput = body.slice(3).trim();
    if (!userInput) return;
    return await handleAIRequest(api, event, userInput, message);
  }
};
