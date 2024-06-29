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
// Test the function with various YouTube URLs
const urls = ["https://www.youtube.com/watch?v=A859CeMM31U"];

urls.forEach(async(url) => {
  console.log(`${url} => ${await extractYouTubeVideoID(url)}`);
});
