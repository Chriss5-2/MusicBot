const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { exec } = require('child_process');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('clientReady', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!play') || message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  if (args.length < 2) return message.reply('❌ Debes proporcionar un enlace de YouTube. Ejemplo: !play <url>');

  const url = args[1].trim();
  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) return message.reply('🎧 ¡Debes estar en un canal de voz!');

  message.reply(`🎵 Obteniendo stream de audio...`);

  exec(`python get_url.py "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al obtener URL: ${error.message}`);
      return message.reply('❌ No pude obtener el audio.');
    }

    const audioUrl = stdout.trim();
    console.log('🎶 Stream URL:', audioUrl);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    console.log(`Cargando audio...`);
    const resource = createAudioResource(audioUrl, { inlineVolume: true });
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => connection.destroy());
    message.reply(`▶️ Reproduciendo: ${url}`);
  });
});

client.login(process.env.TOKEN);
