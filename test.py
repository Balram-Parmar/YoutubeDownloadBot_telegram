# importing pafy 
import pafy 
	
# url of video 
url = "https://www.youtube.com/watch?v=vG2PNdI8axo"
	
# getting video 
video = pafy.new(url) 

# getting all the available streams 
streams = video.allstreams 

# selecting one stream 
stream = streams[1] 

# getting https url of stream 
value = stream.url_https 

# printing the value 
print("URL Https : " + str(value)) 
