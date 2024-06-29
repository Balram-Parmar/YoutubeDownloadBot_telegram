const ytdl = require("ytdl-core");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { get } = require("http");

ffmpeg.setFfmpegPath(ffmpegStatic);

async function downloadYouTubeVideo(videoUrl) {
  const info = await ytdl.getInfo(videoUrl);

  console.log(`Downloading: ${info.videoDetails.title}`);

  fs.writeFileSync("info.json", JSON.stringify(info, null, 2), "utf-8");

  const videoFormat = ytdl.chooseFormat(info.formats, {
    quality: "137",
  });

  

  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
  });

  console.log(`Video Format: ${videoFormat.qualityLabel}`);

  console.log(`Audio Format: ${audioFormat.audioBitrate}kbps`);

  const videoOutput = "temp_video.mp4";

  const audioOutput = "temp_audio.mp4";

  console.log("Downloading video...");

  await new Promise((resolve, reject) => {
    
    ytdl(videoUrl, { format: videoFormat })
      .pipe(fs.createWriteStream(videoOutput))
      .on("finish", resolve)
      .on("error", reject);
  });

  console.log("Downloading audio...");
  await new Promise((resolve, reject) => {
    ytdl(videoUrl, { format: audioFormat })
      .pipe(fs.createWriteStream(audioOutput))
      .on("finish", resolve)
      .on("error", reject);
  });

  console.log("Merging audio and video...");
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoOutput)
      .input(audioOutput)
      .videoCodec("copy")
      .audioCodec("aac")
      .on("end", () => {
        console.log("Merging completed!");
        // Clean up temporary files
        fs.unlinkSync(videoOutput);
        fs.unlinkSync(audioOutput);
        resolve();
      })
      .on("error", (err) => {
        console.error("Error during merging:", err);
        reject(err);
      })
      .save(info.videoDetails.title + ".mp4");
  });

  console.log("Download and merge completed!");
}

downloadYouTubeVideo('https://www.youtube.com/watch?v=Evut8BfrZ2U')

