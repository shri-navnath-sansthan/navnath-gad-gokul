const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* ================= CLOUDINARY CONFIG ================= */

cloudinary.config({
  cloud_name: "djxhwbxah",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* ================= PASSWORD ================= */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "shri";

/* ================= MULTER ================= */

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

/* ================= AUTH FUNCTION (NEW 🔥) ================= */

function checkPassword(req, res) {
  const password = req.body.password;

  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: "Wrong password" });
    return false;
  }

  return true;
}

/* ================= UPLOAD PHOTOS ================= */

app.post("/upload", upload.array("image", 25), async (req, res) => {

  if (!checkPassword(req, res)) return;

  try {

    const files = req.files;
    const captions = req.body.captions;
    const month = req.body.month || "";
    const year = req.body.year || "";

    if (!files || files.length === 0) {
      return res.json({ success: false, message: "No files" });
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {

      const file = files[i];
      const caption = Array.isArray(captions) ? captions[i] : captions;

      const result = await new Promise((resolve, reject) => {

        cloudinary.uploader.upload_stream(
          {
            folder: "gallery",
            tags: ["gallery"],
            context: {
              caption: caption || "",
              month: month,
              year: year
            }
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);

      });

      uploadedImages.push({
        secure_url: result.secure_url,   // 🔥 FIXED NAME
        public_id: result.public_id
      });

    }

    res.json({ success: true, images: uploadedImages });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }

});

/* ================= UPLOAD VIDEOS ================= */

app.post("/upload-video", upload.array("video", 10), async (req, res) => {

  if (!checkPassword(req, res)) return;

  try {

    const files = req.files;
    const month = req.body.month || "";
    const year = req.body.year || "";

    if (!files || files.length === 0) {
      return res.json({ success: false });
    }

    const uploadedVideos = [];

    for (let i = 0; i < files.length; i++) {

      const file = files[i];

      const result = await new Promise((resolve, reject) => {

        cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "videos",
            chunk_size: 6000000,
            context: {
              month: month,
              year: year
            }
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);

      });

      uploadedVideos.push({
        secure_url: result.secure_url,
        public_id: result.public_id
      });

    }

    res.json({ success: true, videos: uploadedVideos });

  } catch (err) {
    console.error("VIDEO UPLOAD ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }

});

/* ================= GET PHOTOS ================= */

app.get("/gallery", async (req, res) => {

  try {

    const result = await cloudinary.search
      .expression("folder:gallery")
      .sort_by("created_at", "desc")
      .max_results(100)
      .with_field("context")
      .execute();

    res.json(result.resources);

  } catch (err) {
    console.error("GALLERY ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }

});

/* ================= GET VIDEOS ================= */

app.get("/videos", async (req, res) => {

  try {

    const result = await cloudinary.search
      .expression("folder:videos")
      .sort_by("created_at", "desc")
      .max_results(100)
      .with_field("context")
      .execute();

    res.json(result.resources);

  } catch (err) {
    console.error("VIDEOS ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }

});

/* ================= DELETE PHOTO ================= */

app.post("/delete-photo", async (req, res) => {

  if (!checkPassword(req, res)) return;

  try {

    const { public_id } = req.body;

    await cloudinary.uploader.destroy(public_id);

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE PHOTO ERROR:", err);
    res.json({ success: false, error: err.message });
  }

});

/* ================= DELETE VIDEO ================= */

app.post("/delete-video", async (req, res) => {

  if (!checkPassword(req, res)) return;

  try {

    const { public_id } = req.body;

    await cloudinary.uploader.destroy(public_id, {
      resource_type: "video"
    });

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE VIDEO ERROR:", err);
    res.json({ success: false, error: err.message });
  }

});

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
  res.send("Navnath Upload Server Running 🚀");
});

app.get("/ping", (req, res) => {
  res.send("Server is awake 🚀");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});