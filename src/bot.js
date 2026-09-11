require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { fetchDefinition } = require('./dictionary');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = process.env.PREFIX || '?';

client.once('ready', () => {
  console.log(`Dictatorship is online! Logged in as ${client.user.tag}`);
  client.user.setActivity(`${PREFIX}def <word>`, { type: 2 });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    const msg = await message.reply('Pinging...');
    const latency = msg.createdTimestamp - message.createdTimestamp;
    return msg.edit(`Pong! Latency: \`${latency}ms\` | Gateway: \`${client.ws.ping}ms\``);
  }

  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle('Dictatorship Commands')
      .setDescription('A lightweight dictionary bot for quick word definitions.')
      .addFields(
        { name: `\`${PREFIX}def <word>\``, value: 'Fetch definition, pronunciation, and examples.' },
        { name: `\`${PREFIX}ping\``, value: 'Check bot and API latency.' },
        { name: `\`${PREFIX}help\``, value: 'Show this help menu.' }
      )
      .setFooter({ text: 'Created by Costa' });

    return message.reply({ embeds: [embed] });
  }

  if (command === 'def' || command === 'define' || command === 'd') {
    const word = args.join(' ');
    if (!word) {
      return message.reply(`Please provide a word. Example: \`${PREFIX}def serendipity\``);
    }

    const result = await fetchDefinition(word);

    if (!result.success) {
      return message.reply(`No definition found for **${word}**.`);
    }

    const dict = result.data;
    const embed = new EmbedBuilder()
      .setColor(0x5a65ea)
      .setTitle(dict.word.charAt(0).toUpperCase() + dict.word.slice(1))
      .setURL(dict.sourceUrl)
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const header = [];
    if (dict.phonetic) header.push(`*${dict.phonetic}*`);
    if (dict.audio) header.push(`[Audio](${dict.audio})`);
    if (header.length > 0) embed.setDescription(header.join(' • '));

    for (const meaning of dict.meanings.slice(0, 2)) {
      const lines = [];
      meaning.definitions.slice(0, 2).forEach((d, i) => {
        const num = meaning.definitions.length > 1 ? `${i + 1}. ` : '';
        lines.push(`${num}${d.definition}`);
        if (d.example) {
          lines.push(`> *“${d.example}”*`);
        }
      });

      embed.addFields({
        name: meaning.partOfSpeech.charAt(0).toUpperCase() + meaning.partOfSpeech.slice(1),
        value: lines.join('\n').slice(0, 1024) || 'No definition text available.'
      });
    }

    return message.reply({ embeds: [embed] });
  }
});

if (!process.env.BOT_TOKEN) {
  console.error('Error: BOT_TOKEN is missing in the .env file.');
  process.exit(1);
}

client.login(process.env.BOT_TOKEN).catch((err) => {
  console.error('Failed to login to Discord:', err.message);
});
