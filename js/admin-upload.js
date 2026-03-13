const now = new Date();

const months = [
"जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून",
"जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"
];

// default month year
document.getElementById("month").value = months[now.getMonth()];
document.getElementById("year").value = now.getFullYear();

const fileInput = document.getElementById("image");
const captionContainer = document.getElementById("captionContainer");

const progressBar = document.getElementById("uploadProgress");
const progressText = document.getElementById("progressText");
const overlay = document.getElementById("uploadOverlay");
const uploadBtn = document.getElementById("uploadBtn");

// image preview
fileInput.addEventListener("change", function(){

captionContainer.innerHTML = "";

const files = fileInput.files;

for(let i=0;i<files.length;i++){

const file = files[i];

const div = document.createElement("div");
div.style.marginBottom="15px";

const img = document.createElement("img");
img.src = URL.createObjectURL(file);
img.style.width="80px";
img.style.height="80px";
img.style.objectFit="cover";
img.style.borderRadius="6px";
img.style.display="block";
img.style.marginBottom="5px";

div.appendChild(img);

const name=document.createElement("p");
name.innerText=file.name;
div.appendChild(name);

const input=document.createElement("input");
input.type="text";
input.placeholder="Caption लिहा";
input.className="captionInput";

div.appendChild(input);

captionContainer.appendChild(div);

}

});

const form=document.getElementById("uploadForm");

form.addEventListener("submit",function(e){

e.preventDefault();

const files=fileInput.files;

if(files.length===0){
alert("कृपया फोटो निवडा 📷");
return;
}

uploadBtn.disabled=true;
overlay.style.display="flex";

const captions=document.querySelectorAll(".captionInput");

const month=document.getElementById("month").value;
const year=document.getElementById("year").value;

const formData=new FormData();

for(let i=0;i<files.length;i++){
formData.append("image",files[i]);
formData.append("captions",captions[i].value);
}

formData.append("month",month);
formData.append("year",year);

const xhr=new XMLHttpRequest();

xhr.open("POST","https://navnath-upload-server.onrender.com/upload");

xhr.upload.onprogress=function(e){

if(e.lengthComputable){

const percent=Math.round((e.loaded/e.total)*100);

progressBar.value=percent;
progressText.innerText="Uploading "+percent+"%";

}

};

xhr.onload=function(){

uploadBtn.disabled=false;
overlay.style.display="none";

if(xhr.status===200){

alert("✅ upload झाले!");

form.reset();
captionContainer.innerHTML="";

document.getElementById("month").value=months[new Date().getMonth()];
document.getElementById("year").value=new Date().getFullYear();

}else{

alert("❌ Upload failed");

}

};

xhr.send(formData);

});