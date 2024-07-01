const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

function setExpireDate(id) {
  const expireDate = new Date();
  expireDate.setMinutes(expireDate.getMinutes() + 1);

  const idExpireDateObj = {
    id: id,
    expireDate: expireDate,
  };

  fs.writeFileSync(
    path.join(__dirname, "data.json"),
    JSON.stringify(idExpireDateObj)
  );
}

app.post("/setExpireDate", (req, res) => {
  const { id } = req.body;
  const expireDate = setExpireDate(id);
  res.json({ expireDate });
});

const port = 3000; // Specify the port number you want to use
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
