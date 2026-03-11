const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: "djxhwbxah",
  api_key: "YOUR_API_KEY",
  api_secret: "YOUR_NEW_SECRET"
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {

  try {

    const caption = req.body.caption;
    const month = req.body.month;
    const year = req.body.year;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "gallery" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const imageUrl = result.secure_url;

    const newImage = {
      src: imageUrl,
      month: month,
      year: year,
      caption: caption
    };

    const data = fs.readFileSync("../gallery.json");
    const images = JSON.parse(data);

    images.unshift(newImage);

    fs.writeFileSync("../gallery.json", JSON.stringify(images, null, 2));

    res.json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

app.get("/", (req, res) => {
  res.send("Upload server running 🚀");
});

app.listen(3000, () => {
  console.log("Server running");
});