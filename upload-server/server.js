const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* Cloudinary Config */
cloudinary.config({
  cloud_name: "djxhwbxah",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* Multer memory storage */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* Upload API */
app.post("/upload", upload.single("image"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded"
      });
    }

    const caption = req.body.caption || "";
    const month = req.body.month || "";
    const year = req.body.year || "";

    const result = await new Promise((resolve, reject) => {

      cloudinary.uploader.upload_stream(
        {
          folder: "gallery",

          /* IMPORTANT */
          tags: ["gallery"],

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
      imageUrl: result.secure_url,
      public_id: result.public_id
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

/* Server Test Route */
app.get("/", (req, res) => {
  res.send("Upload server running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});