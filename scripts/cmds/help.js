const { commands, aliases } = global.GoatBot;

// --- Fonction pour transformer un texte en style BOLD SANS ---
function toBoldStyle(text) {
  const boldMap = {
    A:'𝗔', B:'𝗕', C:'𝗖', D:'𝗗', E:'𝗘', f:'𝗳', G:'𝗚', H:'𝗛', I:'𝗜', J:'𝗝',
    K:'𝗞', L:'𝗟', M:'𝗠', N:'𝗡', O:'𝗢', P:'𝗣', Q:'𝗤', R:'𝗥', S:'𝗦', T:'𝗧',
    U:'𝗨', V:'𝗩', W:'𝗪', X:'𝗫', Y:'𝗬', Z:'𝒁',
    a:'𝗮', b:'𝗯', c:'𝗰', d:'𝗱', e:'𝗲', f:'𝗳', g:'𝗴', h:'𝗵', i:'𝗶', j:'𝗷',
    k:'𝗸', l:'𝗹', m:'𝗺', n:'𝗻', o:'𝗼', p:'𝗽', q:'𝗾', r:'𝗿', s:'𝘀', t:'𝘁',
    u:'𝘂', v:'𝘃', w:'𝘄', x:'𝘅', y:'𝘆', z:'𝘇',
    '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵',
    ' ':' '
  };
  return text.split('').map(c => boldMap[c] || c).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "6.5",
    author: "Camille-Dev 🩵",
    countDown: 2,
    role: 0,
    shortDescription: { fr: "Afficher le catalogue des commandes" },
    category: "info",
    guide: { fr: "{pn} <nom_commande> ou {pn} -ai <mot_clé>" },
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const uid = event.senderID;
      const name = await usersData.getName(uid);
      let avatar = await usersData.getAvatarUrl(uid).catch(() => "https://i.imgur.com/TPHk4Qu.png");

      // --- Mode Suggestion IA ---
      if(args[0]?.toLowerCase() === "-ai") {
        const keyword = args[1]?.toLowerCase() || "";
        const allCmds = Array.from(commands.keys());
        const suggestions = allCmds
          .map(cmd => ({ cmd, match: Math.max(40, 100 - Math.abs(cmd.length - keyword.length) * 10) }))
          .filter(c => c.cmd.includes(keyword))
          .sort((a,b)=>b.match - a.match)
          .slice(0,5);

        const body = `🤖 𝗔𝗡𝗔𝗟𝗬𝗦𝗘 𝗗𝗘 𝗖𝗔𝗠𝗜𝗟𝗟𝗘 🇨🇮\n\n` + 
          (suggestions.length ? suggestions.map(s=>`✅ ${toBoldStyle(s.cmd)} (${s.match}% match)`).join("\n") : "❌ Aucun mogo n'a trouvé de commande correspondante.");

        return message.reply({ body, attachment: await global.utils.getStreamFromURL(avatar) });
      }

      // --- Liste Complète ---
      if(!args || args.length === 0) {
        let body = `┏━━━━━ 🇨🇮 𝗛𝗘𝗟𝗣 𝗠𝗘𝗡𝗨 ━━━━━┓\n`;
        body += `  Salut ${name.split(' ')[0]}, voici tes outils !\n`;
        body += `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        const categories = {};
        for(let [name, cmd] of commands) {
          const cat = cmd.config.category || "DIVERS";
          if(!categories[cat]) categories[cat] = [];
          categories[cat].push(name);
        }

        for(const cat of Object.keys(categories).sort()) {
          const list = categories[cat].sort().map(c=>`${c}`).join(", ");
          body += `📂 【 ${cat.toUpperCase()} 】\n» ${toBoldStyle(list)}\n\n`;
        }

        body += `──────────────\n`;
        body += `📊 Total : ${commands.size} commandes\n`;
        body += `💡 Infos : .help [nom]\n`;
        body += `⚡ Créateur : Camille-Dev 🩵`;

        return message.reply({ body, attachment: await global.utils.getStreamFromURL(avatar)});
      }

      // --- Détails d'une commande ---
      const query = args[0].toLowerCase();
      const command = commands.get(query) || commands.get(aliases.get(query));
      
      if(!command) {
        return message.reply({ body: `❌ Ahiii ! La commande "${query}" n'est pas dans mon quartier.`, attachment: await global.utils.getStreamFromURL(avatar)});
      }

      const cfg = command.config || {};
      const roleNames = { 0: "Tout le monde", 1: "Admins de groupe", 2: "Grands Mogos (Admins Bot)", 3: "Camille uniquement" };

      const card = [
        `✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘 : ${toBoldStyle(cfg.name.toUpperCase())} ✨`,
        `──────────────────`,
        `📝 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 : ${cfg.longDescription?.fr || cfg.shortDescription?.fr || "Pas de dossier dispo."}`,
        `📂 𝗖𝗮𝘁𝗲́𝗴𝗼𝗿𝗶𝗲 : ${cfg.category || "Divers"}`,
        `🔤 𝗔𝗹𝗶𝗮𝘀 : ${Array.isArray(cfg.aliases) ? cfg.aliases.join(", ") : "Aucun"}`,
        `🛡️ 𝗥𝗮𝗻𝗴 : ${roleNames[cfg.role] || "Inconnu"}`,
        `⏱️ 𝗔𝘁𝘁𝗲𝗻𝘁𝗲 : ${cfg.countDown || 1}s`,
        `🚀 𝗔𝘂𝘁𝗲𝘂𝗿 : ${cfg.author || "Inconnu"}`,
        `──────────────────`,
        `💡 𝗨𝘀𝗮𝗴𝗲 : .${cfg.name} ${cfg.guide?.fr || ""}`
      ].join("\n");

      return message.reply({ body: card, attachment: await global.utils.getStreamFromURL(avatar)});

    } catch(err) {
      await message.reply(`⚠️ Dra technique : ${err.message}`);
    }
  }
};
