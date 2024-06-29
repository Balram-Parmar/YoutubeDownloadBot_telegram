const axios = require("axios");
const fs = require("fs");

const url =
  "https://rr4---sn-ci5gup-5hqs.googlevideo.com/videoplayback?expire=1719665247&ei=_61_ZtqqH4ivjuMP2aONyAI&ip=223.235.159.152&id=o-AHe0XiMdw-3gUGAWLJezUODmx8RDTMRhY0BcdRC_v2j0&itag=702&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303%2C308%2C315%2C330%2C331%2C332%2C333%2C334%2C335%2C336%2C337%2C694%2C695%2C696%2C697%2C698%2C699%2C700%2C701%2C702&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=pI&mm=31%2C29&mn=sn-ci5gup-5hqs%2Csn-ci5gup-qxay&ms=au%2Crdu&mv=m&mvi=4&pl=21&initcwndbps=1571250&bui=AbKP-1OuIs0PkxR3-yfgFikJvPSyO-tECjRIC1roBBwRwiseTWO4p5n50oB6WH_PHqocGw6hGsQqBbV9&spc=UWF9f-fPQpyvmhBnRu3PNZn7g6pKBvT3vGUJseBapZt305_p8mpMjc-rSCDr&vprv=1&svpuc=1&mime=video%2Fmp4&ns=6qBl4ht-jA1UkDpybBUQW0QQ&rqh=1&gir=yes&clen=3872001301&dur=625.808&lmt=1719223227386183&mt=1719643265&fvip=5&keepalive=yes&c=WEB&sefc=1&txp=5502434&n=lK6bUsQgBhQzLw&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgbE9p-jvV9s4kvV1lJAWFgODpaAoVk8F5NsUVtRy-oPoCIEzVBsQSsDQLEkZSvkB1ZCog8qLRZ8FNUPv5eTrP8fWn&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AHlkHjAwRgIhAJrUYsUaL88g3dVVPE3k0TIKXE_cSjWyT9vv4Fn-nq15AiEAiHBjvYs_ryuMEhhqr2BJnl8MnPxXT8H8nHkXDZA6HxM%3D";
// Replace with your file URL
const outputPath = "large.mp4";
const chunkSize = 10 * 1024 * 1024; // 10 MB

async function downloadFile(url, outputPath, chunkSize) {
  // Get the total file size from the headers
  const { headers } = await axios.head(url);
  const totalSize = parseInt(headers["content-length"], 10);
  console.log(`Total file size: ${totalSize} bytes`);

  const fileStream = fs.createWriteStream(outputPath, { flags: "a" });

  let downloadedSize = 0;

  while (downloadedSize < totalSize) {
    const end = Math.min(downloadedSize + chunkSize, totalSize) - 1;
    console.log(
      `Downloaded ${Math.round((end + 1) / (1024 * 1024))} MB/${Math.round(
        totalSize / (1024 * 1024)
      )} MB`
    );

    const { data } = await axios.get(url, {
      responseType: "stream",
      headers: {
        Range: `bytes=${downloadedSize}-${end}`,
      },
    });

    data.pipe(fileStream, { end: false });

    await new Promise((resolve, reject) => {
      data.on("end", resolve);
      data.on("error", reject);
    });

    downloadedSize = end + 1;
  }

  fileStream.end();
  console.log("Download complete");
}

downloadFile(url, outputPath, chunkSize).catch((err) => console.error(err));
