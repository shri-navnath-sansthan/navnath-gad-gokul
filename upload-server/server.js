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

/* ================= UPLOAD PHOTOS ================= */

app.post("/upload", upload.array("image", 25), async (req, res) => {

  try {

    const files = req.files;
    const captions = req.body.captions;
    const month = req.body.month || "";
    const year = req.body.year || "";

    if (!files || files.length === 0) {
      return res.json({ success:false });
    }

    const uploadedImages = [];

    for(let i=0;i<files.length;i++){

      const file = files[i];
      const caption = Array.isArray(captions) ? captions[i] : captions;

      const result = await new Promise((resolve,reject)=>{

        cloudinary.uploader.upload_stream(
          {
            folder:"gallery",
            tags:["gallery"],
            context:{
              caption:caption,
              month:month,
              year:year
            }
          },
          (error,result)=>{
            if(error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);

      });

      uploadedImages.push({
        imageUrl:result.secure_url,
        public_id:result.public_id
      });

    }

    res.json({
      success:true,
      images:uploadedImages
    });

  } catch(err){

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

});

/* ================= UPLOAD VIDEOS ================= */

app.post("/upload-video", upload.array("video", 10), async (req, res) => {

  try {

    const files = req.files;
    const captions = req.body.captions;
    const month = req.body.month || "";
    const year = req.body.year || "";

    if (!files || files.length === 0) {
      return res.json({ success:false });
    }

    const uploadedVideos = [];

    for(let i=0;i<files.length;i++){

      const file = files[i];
      const caption = Array.isArray(captions) ? captions[i] : captions;

      const result = await new Promise((resolve,reject)=>{

        cloudinary.uploader.upload_stream(
          {
            resource_type: "video", // 🔥 IMPORTANT
            folder:"videos",
            tags:["videos"],
            context:{
              caption:caption,
              month:month,
              year:year
            }
          },
          (error,result)=>{
            if(error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);

      });

      uploadedVideos.push({
        videoUrl:result.secure_url,
        public_id:result.public_id
      });

    }

    res.json({
      success:true,
      videos:uploadedVideos
    });

  } catch(err){

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

});

/* ================= API GALLERY ================= */

app.get("/gallery", async (req,res)=>{

  try{

    const result = await cloudinary.search
      .expression("folder:gallery")
      .sort_by("created_at","desc")
      .max_results(100)
      .with_field("context")
      .execute();

    res.json(result.resources);

  }catch(err){

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

});

/* ================= API VIDEOS ================= */

app.get("/videos", async (req,res)=>{

  try{

    const result = await cloudinary.search
      .expression("folder:videos")
      .sort_by("created_at","desc")
      .max_results(100)
      .with_field("context")
      .execute();

    res.json(result.resources);

  }catch(err){

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

});

/* ================= DELETE PHOTO ================= */

app.post("/delete-photo", async (req,res)=>{

  const {public_id,password} = req.body;

  if(password !== "shri"){
    return res.json({success:false});
  }

  try{

    await cloudinary.uploader.destroy(public_id);

    res.json({success:true});

  }catch(err){

    res.json({
      success:false,
      error:err.message
    });

  }

});

/* ================= DELETE VIDEO ================= */

app.post("/delete-video", async (req,res)=>{

  const {public_id,password} = req.body;

  if(password !== "shri"){
    return res.json({success:false});
  }

  try{

    await cloudinary.uploader.destroy(public_id, {
      resource_type: "video"
    });

    res.json({success:true});

  }catch(err){

    res.json({
      success:false,
      error:err.message
    });

  }

});


// SERVER

app.get("/", (req, res) => {
  res.send("Navnath Gallery Upload Server Running 🚀");
});

// ✅ FIX: ping route वर हलवा
app.get("/ping", (req, res) => {
  res.send("Server is awake 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});