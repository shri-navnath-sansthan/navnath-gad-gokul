const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* Cloudinary config */
cloudinary.config({
  cloud_name: "djxhwbxah",
  api_key: "332867976324913",
  api_secret: "UupLdCHel2pTBO_1DV17HjCKZQM"
});

/* Multer setup */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* Test route */
app.get("/", (req, res) => {
  res.send("Navnath Upload Server Running 🚀");
});

/* Upload route */
app.post("/upload", upload.single("image"), async (req, res) => {

  try {

    const result = await new Promise((resolve, reject) => {

      const stream = cloudinary.uploader.upload_stream(
        { folder: "navnath-gallery" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);

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

/* Render dynamic port */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});