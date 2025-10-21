import yt_dlp
import sys

url = sys.argv[1]

ydl_opts = {
    'format': 'bestaudio/best',
    'quiet': True,
    'skip_download': True,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(url, download=False)
    print(info['url'])  # <- imprime el enlace directo al audio
