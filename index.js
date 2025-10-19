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

  // Aquí reemplazamos la descarga y stream de play-dl
  let mp3Path = 'cancion.mp3';
  message.reply(`🎵 Descargando canción...`);

  exec(`python download.py "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al descargar: ${error.message}`);
      return message.reply('❌ No pude descargar la canción.');
    }
    console.log(stdout);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const resource = createAudioResource(mp3Path);
    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => connection.destroy());

    message.reply(`▶️ Reproduciendo: ${url}`);
  });
});

client.login(process.env.TOKEN);
