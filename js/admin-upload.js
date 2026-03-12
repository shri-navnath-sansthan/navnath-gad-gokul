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

const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("uploadProgress");

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

// show progress
progressBox.style.display="block";
progressBar.value=0;

const xhr=new XMLHttpRequest();

xhr.open("POST","https://navnath-upload-server.onrender.com/upload");

xhr.upload.onprogress=function(e){

if(e.lengthComputable){

const percent=(e.loaded/e.total)*100;
progressBar.value=percent;

}

};

xhr.onload=function(){

if(xhr.status===200){

alert("✅ सर्व फोटो upload झाले!");

form.reset();
captionContainer.innerHTML="";

progressBox.style.display="none";

document.getElementById("month").value=months[new Date().getMonth()];
document.getElementById("year").value=new Date().getFullYear();

}else{

alert("❌ Upload failed");

}

};

xhr.send(formData);

});
