import yt_dlp

def download_youtube_video(url, output_path='%(title)s.%(ext)s'):
    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        video_title = info['title']
        print(f"Downloading: {video_title}")
        
        ydl.download([url])
        
    print("Download completed!")

# Usage
video_url = 'https://www.youtube.com/watch?v=DMHiMDV-8T0'
download_youtube_video(video_url)