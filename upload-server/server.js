const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: "djxhwbxah",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {

  try {

    const caption = req.body.caption || "";
    const month = req.body.month || "";
    const year = req.body.year || "";

    const result = await new Promise((resolve, reject) => {

      cloudinary.uploader.upload_stream(
        {
          folder: "gallery",
          context: `caption=${caption}|month=${month}|year=${year}`
        },
        (error, result) => {

          if (error) reject(error);
          else resolve(result);

        }
      ).end(req.file.buffer);

    });

    res.json({
      success: true,
      imageUrl: result.secure_url
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

app.get("/", (req, res) => {
  res.send("Upload server running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});