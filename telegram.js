const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { authorize, uploadFile } = require("./drive.js");
const { PassThrough } = require("stream");
const { info } = require("console");

ffmpeg.setFfmpegPath(ffmpegStatic);

const token = "7156204414:AAFo4NcukUJkbagKOWDluRNd_KGOsYU2KrM";

const bot = new TelegramBot(token, { polling: true });
async function extractYouTubeVideoID(url) {
  return new Promise((resolve, reject) => {
    try {
      const pattern =
        /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(pattern);
      resolve(match ? match[1] : null);
    } catch (error) {
      console.log("Error:", error);
      reject(error);
    }
  });
}

async function getAvailableFormats(videoUrl) {
  const info = await ytdl.getInfo(videoUrl);

  let masterArray = [];
  for (const format of info.formats) {
    if (format.mimeType.includes("video/mp4")) {
      extradata = {
        url: videoUrl,
        itag: format.itag,
      };
      const obj = {
        callback_data: JSON.stringify(extradata),
        text:
          format.qualityLabel +
          " " +
          format.container +
          " " +
          (format.contentLength / (1024 * 1024)).toFixed(2) +
          "MB",
      };
      let arr = [];
      arr.push(obj);
      masterArray.push(arr);
    }
  }

  return masterArray;
}

bot.onText(
  /^((http(s)?:\/\/)?(www\.)?youtube\.com\/(watch\?v=|embed\/|v\/|.+\?v=)|((http(s)?:\/\/)?(www\.)?youtu\.be\/))([a-zA-Z0-9_-]{11})(\S*)?$/,
  async (message) => {
    try {
      const chatId = message.chat.id;
      const videoUrl = await extractYouTubeVideoID(message.text);
      const data = await getAvailableFormats(videoUrl);
      const options = {
        reply_markup: {
          inline_keyboard: data,
        },
        parse_mode: "HTML",
      };
      bot.sendMessage(chatId, "Choose a format:", options);
    } catch (error) {
      console.error("Error:", error);
    }
  }
);
async function processVideo(chatId, videoUrl, videoFormat, audioFormat, info) {
  try {
    await Promise.all([
      downloadVideo(chatId, videoUrl, videoFormat, info),
      downloadAudio(chatId, videoUrl, audioFormat, info),
    ]);

    let id = await mergeAudioAndVideo(chatId, info);
    bot.sendMessage(chatId, `Video processed successfully!`);
    bot.sendMessage(chatId, `https://drive.google.com/file/d/${id}/view`);
  } catch (error) {
    console.error("Error processing video:", error);
    bot.sendMessage(chatId, "An error occurred while processing the video.");
  }
}

async function downloadVideo(chatId, videoUrl, videoFormat, info) {
  return new Promise((resolve, reject) => {
    try {
      bot.sendMessage(chatId, "Downloading video...");
      ytdl(videoUrl, { format: videoFormat })
        .pipe(fs.createWriteStream(`tempv${info.videoDetails.title}.mp4`))
        .on("finish", resolve)
        .on("error", reject);
    } catch (error) {
      console.error("Error downloading video:", error);
      bot.sendMessage(chatId, "An error occurred while downloading the video.");
    }
  });
}

async function downloadAudio(chatId, videoUrl, audioFormat, info) {
  return new Promise((resolve, reject) => {
    try {
      bot.sendMessage(chatId, "Downloading audio...");
      ytdl(videoUrl, { format: audioFormat })
        .pipe(fs.createWriteStream(`tempa${info.videoDetails.title}.mp4`))
        .on("finish", resolve)
        .on("error", reject);
    } catch (error) {
      console.error("Error downloading audio:", error);
      bot.sendMessage(chatId, "An error occurred while downloading the audio.");
    }
  });
}

async function mergeAudioAndVideo(chatId, info) {
  return new Promise((resolve, reject) => {
    bot.sendMessage(chatId, "Merging audio and video...Please be patient!!");
    try {
      const passThroughStream = new PassThrough();
      ffmpeg()
        .input(`tempv${info.videoDetails.title}.mp4`)
        .input(`tempa${info.videoDetails.title}.mp4`)
        .videoCodec("copy")
        .audioCodec("aac")
        .on("end", () => {
          console.log("Merging completed!");
          fs.unlinkSync(`tempv${info.videoDetails.title}.mp4`);
          fs.unlinkSync(`tempa${info.videoDetails.title}.mp4`);
        })
        .on("error", (err) => {
          console.error("Error during merging:", err);
          fs.unlinkSync(`tempv${info.videoDetails.title}.mp4`);
          fs.unlinkSync(`tempa${info.videoDetails.title}.mp4`);
        })
        .format("mp4")
        .outputOptions("-movflags frag_keyframe+empty_moov")
        .pipe(passThroughStream);

      authorize().then((client) => {
        let fid = uploadFile(
          client,
          info.videoDetails.title,
          "video/mp4",
          passThroughStream
        );
        console.log("File Id: this", fid);
        resolve(fid);
      });
    } catch (error) {
      console.error("Error in mergeAudioAndVideoStreams:", error);
      reject(error);
    }
  });
}

// async function createDownloadLink(info) {
//   return new Promise((resolve, reject) => {
//     const url = "http://localhost:3000/create-download-link";
//     const headers = {
//       "Content-Type": "application/json",
//     };
//     const data = {
//       fileName: `${info.videoDetails.title.replace(/[^\w\s-]/g, "")}.mp4`,
//       expiryMinutes: 10,
//     };
//     fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(data),
//     })
//       .then((response) => response.json())
//       .then((responseData) => {
//         resolve(responseData.downloadLink);
//       })
//       .catch((error) => {
//         console.log("Error creating download link: ", error);
//         reject(error);
//       });
//   });
// }

bot.on("callback_query", async (query) => {
  chatId = query.message.chat.id;
  const data = JSON.parse(query.data);
  const videoUrl = data.url;
  const itag = data.itag;
  const info = await ytdl.getInfo(videoUrl);
  const videoFormat = info.formats.find((format) => format.itag == itag);
  const audioFormat = ytdl.chooseFormat(info.formats, {});
  try {
    processVideo(chatId, videoUrl, videoFormat, audioFormat, info);
  } catch (error) {
    console.error("Error processing video:", error);
    bot.sendMessage(chatId, "An error occurred while processing the video.");
  }
});
