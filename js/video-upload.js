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

/* ===== UPLOAD ===== */

uploadBtn.addEventListener("click", async function(){

const password = document.getElementById("videoPassword").value;
const files = videoInput.files;

if(files.length === 0){
alert("Select a video 🎥");
return;
}

if(!password){
alert("Enter password 🔐");
return;
}

/* 🔐 PASSWORD CHECK LOADER */

overlay.style.display="flex";
progressBar.value = 0;
progressText.innerText = "🔐 Checking password...";

/* 🔥 VERIFY PASSWORD */

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

progressText.innerText = "❌ Wrong Password";
setTimeout(()=> overlay.style.display="none",1200);
return;
}

}catch(err){
overlay.style.display="none";
alert("❌ Server verify error");
return;
}

/* 🔐 START UPLOAD */

progressText.innerText = "Uploading 0%";
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

alert("✅ Upload successful");

const savedPassword = document.getElementById("videoPassword").value;

videoInput.value = "";
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

/* ===== DELETE WITH LOADER ===== */

btn.onclick=async()=>{

const pass=prompt("Enter admin password 🔐");

if(!pass){
alert("Password not entered ❌");
return;
}

/* 🔐 SHOW LOADER */

overlay.style.display="flex";
progressBar.value = 0;
progressText.innerText = "🗑 Deleting video...";

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

/* 🔓 HIDE LOADER */

overlay.style.display="none";

if(data.success){
alert("✅ Deleted successfully");
loadVideos();
}else{
alert("❌ Wrong Password");
}

}catch(err){
overlay.style.display="none";
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