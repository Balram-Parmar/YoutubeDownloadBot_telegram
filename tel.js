const { Telegraf } = require("telegraf");

// Replace 'YOUR_BOT_TOKEN' with your actual Telegram bot token
const bot = new Telegraf("7156204414:AAFo4NcukUJkbagKOWDluRNd_KGOsYU2KrM");

// Command to start the bot
bot.start((ctx) => ctx.reply("Welcome! Click below to upload a video:"));

// Handle the inline button click for uploading video
bot.action("upload_video", async (ctx) => {
  const videoUrl = "https://example.com/video.mp4"; // Example URL of the video to upload

  try {
    // Implement your video upload logic here (e.g., download from URL, save to storage)
    // For demonstration, we're just acknowledging the request
    await ctx.reply(`Uploading video from URL: ${videoUrl}`);
  } catch (error) {
    console.error("Error uploading video:", error);
    await ctx.reply("Failed to upload video. Please try again later.");
  }
});

// Send inline keyboard with the 'Upload Video' button
bot.on("message", (ctx) => {
  const inlineKeyboard = Telegraf.Markup.inlineKeyboard([
    Telegraf.Markup.button.callback("Upload Video", "upload_video"),
  ]);

  ctx.reply("Click below to upload video:", { reply_markup: inlineKeyboard });
});

// Start the bot
bot
  .launch()
  .then(() => {
    console.log("Bot is running");
  })
  .catch((err) => {
    console.error("Error starting bot", err);
  });
