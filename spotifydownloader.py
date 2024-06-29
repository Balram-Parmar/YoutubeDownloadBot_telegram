import requests
import re

def extract_spotify_song_id(spotify_url):
    """
    Extracts the song ID from a Spotify URL.
    
    Parameters:
    spotify_url (str): The Spotify URL.
    
    Returns:
    str: The extracted song ID, or None if no ID is found.
    """
  
    pattern = r"spotify\.com/track/([a-zA-Z0-9]{22})"
    
  
    match = re.search(pattern, spotify_url)
    
    if match:
       
        return match.group(1)
    else:
     
        return None

id=extract_spotify_song_id('https://open.spotify.com/track/4eEfckO9ZJlMntQJFEjxq6?si=6a1b2e4c626348fd')
url = f"https://api.spotifydown.com/download/{id}"

# Define the headers
headers = {
    "Accept": "application/json",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9",
    "Dnt": "1",
    "If-None-Match": 'W/"1f6-HEwTD5+yZoGJRUHgLlcLL+5fffA"',
    "Origin": "https://spotifydown.com",
    "Priority": "u=1, i",
    "Referer": "https://spotifydown.com/",
    "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0"
}

# Make the GET request
response = requests.get(url, headers=headers)

# Check if the request was successful
if response.status_code == 200:
    
    with open(f'{response.json()['metadata']['title']}.mp3', 'wb') as f:
        print("Downloading file...")
        f.write(requests.get(response.json()['link']).content)
    print("File downloaded successfully.")
else:
    print(f"Request failed with status code: {response.status_code}")
