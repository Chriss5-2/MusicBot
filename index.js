const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, demuxProbe, StreamType } = require('@discordjs/voice');
const { exec } = require('child_process');
const { Readable } = require('stream');
const util = require('util');
require('dotenv').config();

// Creating exec as a promise
const execPromise = util.promisify(exec);

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

  // Using await to get the audio stream URL in case this takes more time
  try {
    // 👇 Espera a que Python termine, sin bloquear
    const { stdout } = await execPromise(`python get_url.py "${url}"`);
    const audioUrl = stdout.trim();
    console.log('🎶 Stream URL:', audioUrl);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const response = await fetch(audioUrl); // Fetch the audio stream

    const stream = Readable.fromWeb(response.body); // Convert to Node.js Readable stream

    // Probe the stream to determine its type
    const { stream: probedStream, type } = await demuxProbe(stream);
    const resource = createAudioResource(probedStream, { 
      inputType: type,    // Use the detected stream type
      inlineVolume: true 
    });

    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => connection.destroy());
    message.reply(`▶️ Reproduciendo: ${url}`);
  } catch (error) {
    console.error('Error:', error);
    message.reply('❌ Ocurrió un error al obtener el audio.');
  }
});

client.login(process.env.TOKEN);
