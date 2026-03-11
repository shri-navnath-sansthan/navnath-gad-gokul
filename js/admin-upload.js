const form = document.getElementById("uploadForm");

form.addEventListener("submit", async function(e){

e.preventDefault();

const file = document.getElementById("image").files[0];

if(!file){

alert("कृपया फोटो निवडा");
return;

}

const caption = document.getElementById("caption").value;
const month = document.getElementById("month").value;
const year = document.getElementById("year").value;

const formData = new FormData();

formData.append("image", file);
formData.append("caption", caption);
formData.append("month", month);
formData.append("year", year);

try{

const res = await fetch("https://navnath-upload-server.onrender.com/upload",{

method:"POST",
body:formData

});

const data = await res.json();

if(data.success){

alert("फोटो यशस्वीपणे अपलोड झाला!");
form.reset();

}else{

alert("Upload failed");

}

}catch(err){

alert("Server error");

}

});