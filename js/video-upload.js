document.addEventListener("DOMContentLoaded", function(){

const videoInput = document.getElementById("video");
const videoCaptionContainer = document.getElementById("videoCaptionContainer");
const uploadBtn = document.getElementById("uploadVideoBtn");

const progressBar = document.getElementById("uploadProgress");
const progressText = document.getElementById("progressText");
const overlay = document.getElementById("uploadOverlay");

/* ===== AUTO MONTH YEAR ===== */

const now = new Date();

const months = [
"जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून",
"जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"
];

document.getElementById("videoMonth").value = months[now.getMonth()];
document.getElementById("videoYear").value = now.getFullYear();

/* ===== PREVIEW ===== */

videoInput.addEventListener("change", function(){

videoCaptionContainer.innerHTML = "";

const files = videoInput.files;

for(let i=0;i<files.length;i++){

const file = files[i];

const div = document.createElement("div");
div.style.marginBottom="15px";

const video = document.createElement("video");
video.src = URL.createObjectURL(file);
video.style.width="120px";
video.controls = true;

div.appendChild(video);

const name = document.createElement("p");
name.innerText = file.name;
div.appendChild(name);

videoCaptionContainer.appendChild(div);

}

});

/* ===== UPLOAD ===== */

uploadBtn.addEventListener("click", function(){

const files = videoInput.files;

if(files.length === 0){
alert("कृपया व्हिडिओ निवडा 🎬");
return;
}

uploadBtn.disabled = true;
overlay.style.display = "flex";

/* ✅ FIXED IDS */
const month = document.getElementById("videoMonth").value;
const year = document.getElementById("videoYear").value;

const formData = new FormData();

for(let i=0;i<files.length;i++){
formData.append("video", files[i]);
}

formData.append("month", month);
formData.append("year", year);

const xhr = new XMLHttpRequest();

xhr.open("POST","https://navnath-upload-server.onrender.com/upload-video");

xhr.upload.onprogress = function(e){
if(e.lengthComputable){
const percent = Math.round((e.loaded/e.total)*100);
progressBar.value = percent;
progressText.innerText = "Uploading Video "+percent+"%";
}
};

xhr.onload = function(){

uploadBtn.disabled = false;
overlay.style.display = "none";

if(xhr.status===200){

alert("✅ Video upload झाला!");

videoInput.value = "";
videoCaptionContainer.innerHTML = "";

loadVideos();

}else{
alert("❌ Upload failed");
}

};

xhr.send(formData);

});

/* ===== LOAD VIDEOS ===== */

function loadVideos(){

fetch("https://navnath-upload-server.onrender.com/videos")
.then(res=>res.json())
.then(data=>{

const videoList = document.getElementById("video-list");
videoList.innerHTML="";

data.forEach(vid=>{

const box=document.createElement("div");
box.style.display="inline-block";
box.style.margin="10px";
box.style.textAlign="center";

const video=document.createElement("video");

/* ⚡ FAST CLOUDINARY LOAD */
video.src = vid.secure_url.replace(
"/upload/",
"/upload/f_auto,q_auto/"
);

video.style.width="150px";
video.controls=true;

const btn=document.createElement("button");
btn.innerText="🗑 Delete";
btn.style.marginTop="5px";

btn.onclick=()=>deleteVideo(vid.public_id);

box.appendChild(video);
box.appendChild(btn);

videoList.appendChild(box);

});

});

}

/* ===== DELETE ===== */

async function deleteVideo(public_id){

if(!confirm("हा व्हिडिओ delete करायचा का?")){
return;
}

const password=prompt("Admin password टाका");

const res=await fetch(
"https://navnath-upload-server.onrender.com/delete-video",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
public_id:public_id,
password:password
})
});

const data=await res.json();

if(data.success){
alert("✅ व्हिडिओ delete झाला");
loadVideos();
}else{
alert("❌ Delete failed");
}

}

/* ===== INIT ===== */

loadVideos();

});