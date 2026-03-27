document.addEventListener("DOMContentLoaded", function(){

/* ===== DATE ===== */

const now = new Date();

const months = [
"जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून",
"जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"
];

document.getElementById("month").value = months[now.getMonth()];
document.getElementById("year").value = now.getFullYear();

/* ===== ELEMENTS ===== */

const fileInput = document.getElementById("image");
const captionContainer = document.getElementById("captionContainer");

const progressBar = document.getElementById("uploadProgress");
const progressText = document.getElementById("progressText");
const overlay = document.getElementById("uploadOverlay");
const uploadBtn = document.getElementById("uploadBtn");

/* ===== IMAGE PREVIEW ===== */

fileInput.addEventListener("change", function(){

captionContainer.innerHTML = "";

const files = fileInput.files;

for(let i=0;i<files.length;i++){

const file = files[i];

const div = document.createElement("div");

const img = document.createElement("img");
img.src = URL.createObjectURL(file);
img.style.width="80px";
img.style.height="80px";
img.style.objectFit="cover";

div.appendChild(img);

const input=document.createElement("input");
input.type="text";
input.placeholder="Enter caption";
input.className="captionInput";

div.appendChild(input);

captionContainer.appendChild(div);

}

});

/* ===== UPLOAD PHOTOS ===== */

const form=document.getElementById("uploadForm");

form.addEventListener("submit", async function(e){

e.preventDefault();

const passwordInput = document.getElementById("adminPassword");
const password = passwordInput.value;

const files=fileInput.files;

if(files.length===0){
alert("Select photos 📷");
return;
}

if(!password){
alert("Enter password 🔐");
return;
}

/* 🔐 PASSWORD CHECK LOADER */

overlay.style.display = "flex";
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
progressBar.value = 0;
uploadBtn.disabled=true;

const captions=document.querySelectorAll(".captionInput");

const month=document.getElementById("month").value;
const year=document.getElementById("year").value;

const formData=new FormData();

formData.append("password",password);
formData.append("month",month);
formData.append("year",year);

for(let i=0;i<files.length;i++){
formData.append("image",files[i]);
formData.append("captions",captions[i]?.value || "");
}

const xhr=new XMLHttpRequest();

xhr.open("POST","https://navnath-upload-server.onrender.com/upload");

/* ✅ PROGRESS FIX */

xhr.upload.onprogress=function(e){
if(e.lengthComputable && e.total > 0){
const percent=Math.round((e.loaded/e.total)*100);
progressBar.value=percent;
progressText.innerText="Uploading "+percent+"%";
}else{
progressText.innerText="Uploading...";
}
};

xhr.onload=function(){

uploadBtn.disabled=false;
overlay.style.display="none";

if(xhr.status===200){

alert("✅ Upload successful");

const savedPassword = passwordInput.value;

form.reset();
captionContainer.innerHTML="";

passwordInput.value = savedPassword;

loadPhotos();

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

/* ===== LOAD PHOTOS ===== */

function loadPhotos(){

fetch("https://navnath-upload-server.onrender.com/gallery")
.then(res=>res.json())
.then(data=>{

const photoList=document.getElementById("photo-list");
photoList.innerHTML="";

data.forEach(img=>{

const box=document.createElement("div");
box.style.display="inline-block";
box.style.margin="10px";
box.style.textAlign="center";

const image=document.createElement("img");

image.src = img.secure_url || img.url;

image.onerror = () => {
image.src = "https://via.placeholder.com/120";
};

image.style.width="120px";
image.style.height="120px";
image.style.objectFit="cover";

const btn=document.createElement("button");
btn.innerText="🗑 Delete";
btn.style.marginTop="5px";

btn.onclick=()=>deletePhoto(img.public_id);

box.appendChild(image);
box.appendChild(btn);

photoList.appendChild(box);

});

})
.catch(err=>{
console.error("Gallery error:", err);
});

}

/* ===== DELETE PHOTO (LOADER ADDED) ===== */

async function deletePhoto(public_id){

if(!confirm("Do you want to delete this photo?")){
return;
}

const password = prompt("Enter admin password 🔐");

if(!password){
alert("Password not entered ❌");
return;
}

/* 🔐 SHOW LOADER */

overlay.style.display="flex";
progressBar.value = 0;
progressText.innerText = "🗑 Deleting photo...";

try{

const res=await fetch(
"https://navnath-upload-server.onrender.com/delete-photo",
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

/* 🔓 HIDE LOADER */

overlay.style.display="none";

if(data.success){
alert("✅ Photo deleted successfully");
loadPhotos();
}else{
alert("❌ Wrong Password");
}

}catch(err){
overlay.style.display="none";
console.error(err);
alert("❌ Network error");
}

}

/* ===== INIT ===== */

loadPhotos();

});