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

document.getElementById("videoMonth").value =
months[now.getMonth()];

document.getElementById("videoYear").value =
now.getFullYear();


/* ===== UPLOAD ===== */

uploadBtn.addEventListener("click", async function(){

const password =
document.getElementById("videoPassword").value;

const files =
videoInput.files;


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

progressText.innerText =
"🔐 Checking password...";


/* 🔥 VERIFY PASSWORD */

try{

const verifyRes = await fetch(
"https://navnath-upload-server.onrender.com/verify-password",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
password
})

}
);


if(verifyRes.status === 401){

progressText.innerText =
"❌ Wrong Password";

setTimeout(
()=>{
overlay.style.display="none";
},
1200
);

return;

}


}catch(err){

overlay.style.display="none";

alert("❌ Server verify error");

return;

}


/* 🔐 START UPLOAD */

progressText.innerText =
"Uploading 0%";

uploadBtn.disabled = true;


const formData =
new FormData();

formData.append(
"password",
password
);


for(let f of files){

formData.append(
"video",
f
);

}


formData.append(
"month",
document.getElementById("videoMonth").value
);

formData.append(
"year",
document.getElementById("videoYear").value
);


const xhr =
new XMLHttpRequest();


xhr.open(
"POST",
"https://navnath-upload-server.onrender.com/upload-video"
);


xhr.upload.onprogress =
function(e){

if(e.lengthComputable){

let p =
Math.round(
(e.loaded/e.total)*100
);

progressBar.value = p;

progressText.innerText =
"Uploading "+p+"%";

}

};


xhr.onload =
function(){

overlay.style.display="none";

uploadBtn.disabled = false;


if(xhr.status===200){

alert(
"✅ Upload successful"
);


const savedPassword =
document.getElementById(
"videoPassword"
).value;


videoInput.value = "";

document.getElementById(
"videoPassword"
).value =
savedPassword;


loadVideos();


}else{

alert(
"❌ Upload failed"
);

}

};


xhr.onerror =
function(){

overlay.style.display="none";

uploadBtn.disabled=false;

alert(
"❌ Network error"
);

};


xhr.send(formData);

});


/* =====================================================
   🎬 LOAD VIDEOS
   ===================================================== */

function loadVideos(){

fetch(
"https://navnath-upload-server.onrender.com/videos"
)

.then(res=>res.json())

.then(data=>{

const list =
document.getElementById(
"video-list"
);


list.innerHTML="";


/* =====================================================
   ☑️ BULK DELETE CONTROLS
   ===================================================== */

const controls =
document.createElement("div");


controls.style.margin =
"15px 0";

controls.style.padding =
"12px";

controls.style.background =
"#f5f5f5";

controls.style.borderRadius =
"10px";

controls.style.width =
"100%";

controls.style.boxSizing =
"border-box";


/* ===== SELECT ALL ===== */

const selectAll =
document.createElement("input");

selectAll.type =
"checkbox";

selectAll.id =
"selectAllVideos";


const selectAllLabel =
document.createElement("label");

selectAllLabel.htmlFor =
"selectAllVideos";

selectAllLabel.innerText =
" ☑️ Select All Videos";


/* ===== SELECTED COUNT ===== */

const selectedCount =
document.createElement("span");

selectedCount.id =
"selectedVideoCount";

selectedCount.innerText =
"   Selected: 0";


/* ===== DELETE SELECTED ===== */

const deleteSelectedBtn =
document.createElement("button");

deleteSelectedBtn.innerText =
" 🗑️ Delete Selected Videos";

deleteSelectedBtn.type =
"button";

deleteSelectedBtn.style.marginLeft =
"15px";

deleteSelectedBtn.style.background =
"#c0392b";

deleteSelectedBtn.style.color =
"white";

deleteSelectedBtn.style.border =
"none";

deleteSelectedBtn.style.padding =
"8px 14px";

deleteSelectedBtn.style.borderRadius =
"6px";

deleteSelectedBtn.style.cursor =
"pointer";


controls.appendChild(
selectAll
);

controls.appendChild(
selectAllLabel
);

controls.appendChild(
selectedCount
);

controls.appendChild(
deleteSelectedBtn
);


list.appendChild(
controls
);


/* =====================================================
   🎬 VIDEO CONTAINER
   ===================================================== */

const videosContainer =
document.createElement("div");

videosContainer.style.display =
"contents";


list.appendChild(
videosContainer
);


/* =====================================================
   🎬 CREATE EACH VIDEO
   ===================================================== */

data.forEach(v=>{


const box =
document.createElement("div");


box.style.display =
"inline-block";

box.style.margin =
"10px";

box.style.textAlign =
"center";


/* ===== CHECKBOX ===== */

const checkbox =
document.createElement("input");

checkbox.type =
"checkbox";

checkbox.className =
"video-select";

checkbox.dataset.publicId =
v.public_id;


/* ===== VIDEO ===== */

const video =
document.createElement("video");

video.src =
v.secure_url;

video.controls =
true;

video.style.width =
"200px";


/* ===== SINGLE DELETE ===== */

const btn =
document.createElement("button");

btn.innerText =
"🗑 Delete";

btn.style.display =
"block";

btn.style.marginTop =
"5px";


btn.onclick =
async()=>{


const pass =
prompt(
"Enter admin password 🔐"
);


if(!pass){

alert(
"Password not entered ❌"
);

return;

}


/* 🔐 SHOW LOADER */

overlay.style.display =
"flex";

progressBar.value =
0;

progressText.innerText =
"🗑 Deleting video...";


try{


const res =
await fetch(
"https://navnath-upload-server.onrender.com/delete-video",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

public_id:
v.public_id,

password:
pass

})

}
);


const result =
await res.json();


/* 🔓 HIDE LOADER */

overlay.style.display =
"none";


if(result.success){

alert(
"✅ Deleted successfully"
);

loadVideos();


}else{

alert(
result.message ||
"❌ Wrong Password"
);

}


}catch(err){

overlay.style.display =
"none";

alert(
"❌ Network error"
);

}

};


/* ===== ADD ELEMENTS ===== */

box.appendChild(
checkbox
);

box.appendChild(
document.createElement("br")
);

box.appendChild(
video
);

box.appendChild(
btn
);


videosContainer.appendChild(
box
);

});


/* =====================================================
   ☑️ UPDATE SELECTED COUNT
   ===================================================== */

function updateSelectedCount(){

const selected =
videosContainer.querySelectorAll(
".video-select:checked"
);


selectedCount.innerText =
`   Selected: ${selected.length}`;

}


/* =====================================================
   ☑️ CHECKBOX CHANGE
   ===================================================== */

videosContainer.addEventListener(
"change",
function(e){

if(
e.target.classList.contains(
"video-select"
)
){

updateSelectedCount();


const allCheckboxes =
videosContainer.querySelectorAll(
".video-select"
);


const checkedCheckboxes =
videosContainer.querySelectorAll(
".video-select:checked"
);


selectAll.checked =
allCheckboxes.length > 0 &&
allCheckboxes.length ===
checkedCheckboxes.length;

}

}
);


/* =====================================================
   ☑️ SELECT ALL
   ===================================================== */

selectAll.addEventListener(
"change",
function(){

const checkboxes =
videosContainer.querySelectorAll(
".video-select"
);


checkboxes.forEach(
checkbox=>{

checkbox.checked =
selectAll.checked;

}
);


updateSelectedCount();

}
);


/* =====================================================
   🗑️ DELETE SELECTED VIDEOS
   ===================================================== */

deleteSelectedBtn.addEventListener(
"click",
function(){


const selected =
videosContainer.querySelectorAll(
".video-select:checked"
);


if(selected.length === 0){

alert(
"⚠️ Please select videos first."
);

return;

}


const publicIds =
Array.from(selected).map(
checkbox =>
checkbox.dataset.publicId
);


deleteSelectedVideos(
publicIds
);

}

);

})


.catch(err=>{

console.error(
"Video load error:",
err
);

});

}


/* =====================================================
   🗑️ BULK DELETE VIDEOS
   ===================================================== */

async function deleteSelectedVideos(
publicIds
){


if(
!confirm(
`⚠️ ${publicIds.length} videos delete करायचे आहेत का?`
)
){

return;

}


const password =
prompt(
"Enter admin password 🔐"
);


if(!password){

alert(
"Password not entered ❌"
);

return;

}


/* 🔐 SHOW LOADER */

overlay.style.display =
"flex";

progressBar.value =
0;

progressText.innerText =
`🗑 Deleting ${publicIds.length} videos...`;


try{


const res =
await fetch(
"https://navnath-upload-server.onrender.com/delete-videos",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

public_ids:
publicIds,

password:
password

})

}
);


const result =
await res.json();


/* 🔓 HIDE LOADER */

overlay.style.display =
"none";


if(result.success){

alert(
`✅ ${publicIds.length} videos deleted successfully`
);

loadVideos();


}else{

alert(
result.message ||
"❌ Videos delete झाले नाहीत."
);

}


}catch(err){

overlay.style.display =
"none";

console.error(
err
);

alert(
"❌ Network error"
);

}

}


/* ===== INIT ===== */

loadVideos();


});