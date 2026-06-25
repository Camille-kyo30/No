const { commands, aliases } = global.GoatBot;
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// --- Fonction pour transformer un texte en style 𝑨𝒁 ---
function toAZStyle(text) {
  const azMap = {
    A:'𝑨', B:'𝑩', C:'𝑪', D:'𝑫', E:'𝑬', F:'𝑭', G:'𝑮', H:'𝑯', I:'𝑰', J:'𝑱',
    K:'𝑲', L:'𝑳', M:'𝑴', N:'𝑵', O:'𝑶', P:'𝑷', Q:'𝑸', R:'𝑹', S:'𝑺', T:'𝑻',
    U:'𝑼', V:'𝑽', W:'𝑾', X:'𝑿', Y:'𝒀', Z:'𝒁',
    a:'𝒂', b:'𝒃', c:'𝒄', d:'𝒅', e:'𝒆', f:'𝒇', g:'𝒈', h:'𝒉', i:'𝒊', j:'𝒋',
    k:'𝒌', l:'𝒍', m:'𝒎', n:'𝒏', o:'𝒐', p:'𝒑', q:'𝒒', r:'𝒓', s:'𝒔', t:'𝒕',
    u:'𝒖', v:'𝒗', w:'𝒘', x:'𝒙', y:'𝒚', z:'𝒛',
    '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
    ' ':' '
  };
  return text.split('').map(c => azMap[c] || c).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "5.4",
    author: "Christus",
    editor: "Camille Uchiha 🌸",
    countDown: 2,
    role: 0,
    shortDescription: { en: "🌸 explore commandes kawaii" },
    category: "info",
    guide: { en: `╭─🌸⋅✧₊˚.GUIDE HELP.˚₊✧⋅🌸─╮
│
│ ✨ {pn} → liste commandes 🫶
│ ✨ {pn} <cmd> → info commande 💙
│ ✨ {pn} -s <mot> → recherche 🥺
│ ✨ {pn} -ai <mot> → suggestion IA ✨
╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯` },
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const uid = event.senderID;
      let avatar = await usersData.getAvatarUrl(uid).catch(() => null);
      if (!avatar) avatar = "https://i.imgur.com/TPHk4Qu.png";

      // GIF kawaii pour help 🌸
      const gifUrl = "https://i.ibb.co/sJjVsf2T/941ec9120662.gif";
      const cachePath = path.join(__dirname, 'cache', `help_${Date.now()}.gif`);

      // Télécharger GIF
      if (!fs.existsSync(path.dirname(cachePath))) {
        fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      }
      const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(cachePath, Buffer.from(response.data, 'utf-8'));

      const autoDelete = async (msgID, delay = 15000) => {
        const countdown = [10,5,3,2,1];
        countdown.forEach((s) => {
          setTimeout(() => {
            message.edit(msgID, `╭─🌸⋅✧₊˚.SUPPRESSION.˚₊✧⋅🌸─╮\n│\n│ 🌸⏳ Suppression dans ${s}s... 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
          }, delay - s*1000);
        });
        setTimeout(async () => {
          try { await message.unsend(msgID); }
          catch (err) { console.error("❌ 𝐇𝐞𝐥𝐩 𝐝𝐞𝐥𝐞𝐭𝐞 𝐞𝐫𝐨𝐫:", err.message); }
        }, delay);
      };

      // --- AI Suggestion ---
      if(args[0]?.toLowerCase() === "-ai") {
        const keyword = args[1]?.toLowerCase() || "";
        const allCmds = Array.from(commands.keys());
        const suggestions = allCmds
        .map(cmd => ({ cmd, match: Math.max(40, 100 - Math.abs(cmd.length - keyword.length) * 10) }))
        .filter(c => c.cmd.includes(keyword))
        .sort((a,b)=>b.match - a.match)
        .slice(0,10);

        if(!suggestions.length) {
          const res = await message.reply({
            body:`╭─🌸⋅✧₊˚.AI SUGGESTION.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Aucune suggestion trouvée 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
            attachment: fs.createReadStream(cachePath)
          });
          setTimeout(() => fs.unlinkSync(cachePath), 3000);
          return autoDelete(res.messageID);
        }

        const body = [
          `╭─🌸⋅✧₊˚.AI SUGGESTIONS.˚₊✧⋅🌸─╮`,
          `│`,
          `│ 🤖🌸 Suggestions IA pour toi~ 🫶`,
          `│`,
        ...suggestions.map(s=>`│ ✨ ${toAZStyle(s.cmd)} → ${s.match}% match 💙`),
          `│`,
          `╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
        ].join("\n");

        const res = await message.reply({ body, attachment: fs.createReadStream(cachePath) });
        setTimeout(() => fs.unlinkSync(cachePath), 3000);
        return autoDelete(res.messageID);
      }

      // --- Command List ---
      if(!args || args.length === 0) {
        let body = `╭─🌸⋅✧₊˚.GOAT BOT COMMANDS.˚₊✧⋅🌸─╮\n│\n│ 🌸✨ Liste des commandes bot 🫶\n│\n`;

        const categories = {};
        for(let [name, cmd] of commands) {
          const cat = cmd.config.category || "Misc";
          if(!categories[cat]) categories[cat] = [];
          categories[cat].push(name);
        }

        for(const cat of Object.keys(categories).sort()) {
          const list = categories[cat].sort().map(c=>`│ ✨ ${toAZStyle(c)} 💙`).join("\n");
          body += `│ 🍓 ${toAZStyle(cat)} 🥺\n${list || "│ 🌸💔 Aucune commande"}\n│ ────────────────\n`;
        }

        body += `│\n│ 📊 Total: ${commands.size} commandes ✨\n`;
        body += `│ 💙 Info:.help <command> 🫶\n`;
        body += `│ 🥺 Search:.help -s <mot> ✨\n`;
        body += `│ 🤖 IA:.help -ai <mot> 💙\n`;
        body += `╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`;

        const res = await message.reply({ body, attachment: fs.createReadStream(cachePath) });
        setTimeout(() => fs.unlinkSync(cachePath), 3000);
        return autoDelete(res.messageID);
      }

      // --- Command Info ---
      const query = args[0].toLowerCase();
      const command = commands.get(query) || commands.get(aliases.get(query));
      if(!command) {
        const res = await message.reply({
          body:`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Commande "${query}" introuvable 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`,
          attachment: fs.createReadStream(cachePath)
        });
        setTimeout(() => fs.unlinkSync(cachePath), 3000);
        return autoDelete(res.messageID);
      }

      const cfg = command.config || {};
      const roleMap = {0:"🌸 Tous",1:"💙 Admin Groupe",2:"👑 Admin Bot"};
      const aliasesList = Array.isArray(cfg.aliases) && cfg.aliases.length? cfg.aliases.map(a=>toAZStyle(a)).join(", ") : "Aucun";
      const desc = cfg.longDescription?.en || cfg.shortDescription?.en || "Aucune description.";
      const usage = cfg.guide?.en || cfg.name;

      const card = [
        `╭─🌸⋅✧₊˚.INFO COMMANDE.˚₊✧⋅🌸─╮`,
        `│`,
        `│ ✨ ${toAZStyle(cfg.name)} ✨`,
        `│ ────────────────`,
        `│ 📝 Desc: ${desc} 🥺`,
        `│ 📂 Cat: ${cfg.category || "Misc"} 💙`,
        `│ 🔤 Alias: ${aliasesList} ✨`,
        `│ 🛡️ Role: ${roleMap[cfg.role] || "Unknown"} 🫶`,
        `│ ⏱️ Cooldown: ${cfg.countDown || 1}s 💙`,
        `│ 🚀 Version: ${cfg.version || "1.0"} ✨`,
        `│ 👨‍💻 Author: ${cfg.author || "Unknown"} 🥺`,
        `│ 💡 Usage:.${toAZStyle(usage)} 🫶`,
        `│ 🔧 Options:.help ${toAZStyle(cfg.name.toLowerCase())} [-u | -i | -a] 💙`,
        `╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`
      ].join("\n");

      const res = await message.reply({ body: card, attachment: fs.createReadStream(cachePath) });
      setTimeout(() => fs.unlinkSync(cachePath), 3000);
      return autoDelete(res.messageID);

    } catch(err) {
      console.error("HELP CMD ERROR:", err);
      await message.reply(`╭─🌸⋅✧₊˚.ERREUR.˚₊✧⋅🌸─╮\n│\n│ 🌸💔 Erreur: ${err.message || err} 🥺\n╰─🌸⋅✧₊˚.˚₊✧⋅🌸─╯`);
    }
  }
};
