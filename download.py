# -*- coding: utf-8 -*-
import sys
import yt_dlp

# Toma la URL desde los argumentos
url = sys.argv[1]

ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': 'cancion',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download([url])

print("Audio descargado como cancion.mp3".encode('utf-8', errors='ignore').decode())
