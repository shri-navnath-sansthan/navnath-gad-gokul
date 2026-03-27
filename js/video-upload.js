document.addEventListener("DOMContentLoaded", function(){

const videoInput = document.getElementById("video");
const uploadBtn = document.getElementById("uploadVideoBtn");

const progressBar = document.getElementById("uploadProgress");
const progressText = document.getElementById("progressText");
const overlay = document.getElementById("uploadOverlay");

/* ===== DATE ===== */

const now = new Date();

const months = [
"जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून",
"जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"
];

document.getElementById("videoMonth").value = months[now.getMonth()];
document.getElementById("videoYear").value = now.getFullYear();

/* ===== UPLOAD (FIXED UX) ===== */

uploadBtn.addEventListener("click", async function(){

const password = document.getElementById("videoPassword").value;
const files = videoInput.files;

if(files.length === 0){
alert("व्हिडिओ निवडा 🎥");
return;
}

if(!password){
alert("पासवर्ड टाका 🔐");
return;
}

/* 🔥 STEP 1: VERIFY PASSWORD FIRST */

try{

const verifyRes = await fetch(
"https://navnath-upload-server.onrender.com/verify-password",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({ password })
}
);

if(verifyRes.status === 401){
alert("❌ Wrong Password 🔐");
return; // 🚫 upload थांबव
}

}catch(err){
alert("❌ Server verify error");
return;
}

/* 🔥 STEP 2: START UPLOAD */

overlay.style.display="flex";
uploadBtn.disabled = true;

const formData = new FormData();
formData.append("password",password);

for(let f of files){
formData.append("video",f);
}

formData.append("month",document.getElementById("videoMonth").value);
formData.append("year",document.getElementById("videoYear").value);

const xhr=new XMLHttpRequest();

xhr.open("POST","https://navnath-upload-server.onrender.com/upload-video");

xhr.upload.onprogress=function(e){
if(e.lengthComputable){
let p=Math.round((e.loaded/e.total)*100);
progressBar.value=p;
progressText.innerText="Uploading "+p+"%";
}
};

xhr.onload=function(){

overlay.style.display="none";
uploadBtn.disabled = false;

if(xhr.status===200){

alert("✅ Upload success");

const savedPassword = document.getElementById("videoPassword").value;

/* RESET */
videoInput.value = "";

/* restore password */
document.getElementById("videoPassword").value = savedPassword;

loadVideos();

}else{
alert("❌ Upload failed");
}

};

xhr.onerror=function(){
overlay.style.display="none";
uploadBtn.disabled=false;
alert("❌ Network error");
};

xhr.send(formData);

});

/* ===== LOAD VIDEOS ===== */

function loadVideos(){

fetch("https://navnath-upload-server.onrender.com/videos")
.then(res=>res.json())
.then(data=>{

const list=document.getElementById("video-list");
list.innerHTML="";

data.forEach(v=>{

const box=document.createElement("div");
box.style.margin="10px";

const video=document.createElement("video");
video.src=v.secure_url;
video.controls=true;
video.style.width="200px";

const btn=document.createElement("button");
btn.innerText="🗑 Delete";
btn.style.display="block";
btn.style.marginTop="5px";

/* DELETE WITH PASSWORD */
btn.onclick=async()=>{

const pass=prompt("Admin password टाका 🔐");

if(!pass){
alert("पासवर्ड टाकला नाही ❌");
return;
}

try{

const res = await fetch(
"https://navnath-upload-server.onrender.com/delete-video",
{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
public_id:v.public_id,
password:pass
})
}
);

const data = await res.json();

if(data.success){
alert("✅ Delete झाला");
loadVideos();
}else{
alert("❌ Wrong Password");
}

}catch(err){
alert("❌ Network error");
}

};

box.appendChild(video);
box.appendChild(btn);
list.appendChild(box);

});

})
.catch(err=>{
console.error("Video load error:", err);
});

}

/* ===== INIT ===== */

loadVideos();

});