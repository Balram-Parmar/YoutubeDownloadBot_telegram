const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


// Middleware to parse JSON bodies

app.use(express.json());

const PORT = 3000;
const FILE_DIR = __dirname; 

// Directory where your files are stored

// Object to keep track of expiring links

let links = {};

// Function to generate a unique ID for each download link

function generateUniqueId() {
  return crypto.randomBytes(16).toString("hex");
}

// Endpoint to create a download link

app.post("/create-download-link", (req, res) => {
  const { fileName, expiryMinutes } = req.body;

  const filePath = path.join(FILE_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const id = generateUniqueId();
  const expiryTime = Date.now() + expiryMinutes * 60000;

  links[id] = {
    filePath: filePath,
    expiryTime: expiryTime,
  };

  res.json({ downloadLink: `http://localhost:${PORT}/download/${id}` });
});

// Endpoint to handle file download

app.get("/download/:id", (req, res) => {
  const { id } = req.params;

  const linkInfo = links[id];
  if (!linkInfo) {
    return res.status(404).json({ error: "Link not found or expired" });
  }

  if (Date.now() > linkInfo.expiryTime) {
    delete links[id];
    return res.status(410).json({ error: "Link expired" });
  }

  res.download(linkInfo.filePath, (err) => {
    if (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).send("Internal Server Error");
      }
    }
  });
});

// Cleanup expired links periodically

setInterval(() => {
  const now = Date.now();
  for (const id in links) {
    if (links[id].expiryTime <= now) {
      delete links[id];
    }
  }
}, 60000); 

// Run every minute

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
