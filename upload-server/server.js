const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: "djxhwbxah",
  api_key: "332867976324913",
  api_secret: "UupLdCHel2pTBO_1DV17HjCKZQM"
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {

  try {

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "gallery" },
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
    res.status(500).json({ error: err.message });
  }

});

app.listen(3000, () => {
  console.log("Server running");
});