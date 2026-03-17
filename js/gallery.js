document.addEventListener("DOMContentLoaded", function () {

const CLOUD_NAME = "YOUR_CLOUD_NAME";
const FOLDER = "navnath-gallery";

// ⚠️ Enable "Resource list" in Cloudinary settings
const API = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${FOLDER}.json`;

const skeleton = document.getElementById("skeleton-loader");
const galleryWrapper = document.getElementById("gallery-wrapper");
const modal = document.getElementById("modal");
const header = document.querySelector("header");
const searchBox = document.getElementById("searchBox");

let images = [];
let currentIndex = 0;

let sliderTrack;
let modalCaption;
let modalCaptionText;
let readMoreBtn;
let imageCounter;

let isExpanded = false;
const COLLAPSED_HEIGHT = 40;

/* ===== FETCH FROM CLOUDINARY ===== */
fetch(API)
.then(res => res.json())
.then(data => {

if(skeleton) skeleton.style.display = "none";

images = data.resources.map((img,index)=>{

// 👉 default metadata (Cloudinary list API मध्ये context नसतो)
let caption = img.public_id.split("/").pop();
let month = "Gallery";
let year = "";

// ⚡ optimized image
let fastImage = img.secure_url.replace(
"/upload/",
"/upload/f_auto,q_auto,w_800/"
);

return{
src: fastImage,
original: img.secure_url,
month: month,
year: year,
caption: caption,
index: index
};

});

renderGallery(images);
createModal();

})
.catch(err=>{
console.log("Cloudinary load error",err);
});

/* ===== SEARCH ===== */
if(searchBox){
searchBox.addEventListener("input",function(){
const value=this.value.toLowerCase();
const filtered=images.filter(img =>
img.caption.toLowerCase().includes(value)
);
renderGallery(filtered);
});
}

/* ===== RENDER ===== */
function renderGallery(imagesList){

galleryWrapper.innerHTML="";

const grouped={};

imagesList.forEach(img=>{
const key = img.month + " " + img.year;
if(!grouped[key]) grouped[key] = [];
grouped[key].push(img);
});

Object.keys(grouped).forEach(monthKey=>{

const monthTitle=document.createElement("h2");
monthTitle.className="month-title";
monthTitle.innerText=monthKey;

const gallery=document.createElement("div");
gallery.className="gallery";

grouped[monthKey].forEach(item=>{

const image=document.createElement("img");

image.src=item.src;
image.loading="lazy";

image.onclick = ()=> openModal(item.index);

gallery.appendChild(image);

});

galleryWrapper.appendChild(monthTitle);
galleryWrapper.appendChild(gallery);

});

}

/* ===== MODAL ===== */
function createModal(){

sliderTrack=document.createElement("div");
sliderTrack.classList.add("modal-track");

images.forEach(img=>{
const image=document.createElement("img");
image.src=img.original;
sliderTrack.appendChild(image);
});

modalCaption=document.createElement("div");
modalCaption.style.position="absolute";
modalCaption.style.bottom="0";
modalCaption.style.width="100%";
modalCaption.style.background="#000";
modalCaption.style.color="#fff";
modalCaption.style.padding="6px";
modalCaption.style.textAlign="center";

modalCaptionText=document.createElement("div");
modalCaptionText.style.overflow="hidden";
modalCaptionText.style.height=COLLAPSED_HEIGHT+"px";
modalCaptionText.style.transition="height 0.3s";

readMoreBtn=document.createElement("div");
readMoreBtn.innerText="आणखी वाचा";
readMoreBtn.style.cursor="pointer";

readMoreBtn.onclick=(e)=>{
e.stopPropagation();
if(!isExpanded){
modalCaptionText.style.height = modalCaptionText.scrollHeight+"px";
readMoreBtn.innerText="कमी करा";
isExpanded=true;
}else{
modalCaptionText.style.height = COLLAPSED_HEIGHT+"px";
readMoreBtn.innerText="आणखी वाचा";
isExpanded=false;
}
};

imageCounter=document.createElement("div");
imageCounter.style.position="absolute";
imageCounter.style.top="20px";
imageCounter.style.left="20px";
imageCounter.style.color="#fff";
imageCounter.style.background="rgba(0,0,0,0.6)";
imageCounter.style.padding="5px 10px";
imageCounter.style.borderRadius="6px";

modal.appendChild(imageCounter);

modalCaption.appendChild(modalCaptionText);
modalCaption.appendChild(readMoreBtn);

modal.appendChild(sliderTrack);
modal.appendChild(modalCaption);

}

/* ===== OPEN ===== */
function openModal(index){
currentIndex=index;
modal.style.display="flex";
if(header) header.style.display="none";
setTimeout(()=>{
setPosition();
updateCaption();
},30);
history.pushState({modalOpen:true},"");
}

/* ===== CAPTION ===== */
function updateCaption(){

modalCaptionText.innerText = images[currentIndex].caption;

imageCounter.innerText =
(currentIndex+1)+" / "+images.length;

modalCaptionText.style.height = COLLAPSED_HEIGHT+"px";
readMoreBtn.innerText="आणखी वाचा";
isExpanded=false;

setTimeout(()=>{
if(modalCaptionText.scrollHeight > COLLAPSED_HEIGHT){
readMoreBtn.style.display="block";
}else{
readMoreBtn.style.display="none";
}
},50);

}

/* ===== CLOSE ===== */
function closeModal(){
modal.style.display="none";
if(header) header.style.display="block";
}

window.closeModal = closeModal;

modal.addEventListener("click",function(e){
if(e.target===modal) closeModal();
});

window.addEventListener("popstate",function(){
if(modal.style.display==="flex") closeModal();
});

/* ===== SWIPE ===== */
let startX=0;
let isDragging=false;
let currentTranslate=0;
let prevTranslate=0;

modal.addEventListener("touchstart",(e)=>{
startX=e.touches[0].clientX;
isDragging=true;
sliderTrack.style.transition="none";
});

modal.addEventListener("touchmove",(e)=>{
if(!isDragging) return;
const currentX=e.touches[0].clientX;
const diff=currentX-startX;
currentTranslate=prevTranslate+diff;
sliderTrack.style.transform=`translateX(${currentTranslate}px)`;
});

modal.addEventListener("touchend",()=>{
isDragging=false;
const movedBy=currentTranslate-prevTranslate;

if(movedBy<-80 && currentIndex<images.length-1) currentIndex++;
if(movedBy>80 && currentIndex>0) currentIndex--;

setPosition();
updateCaption();
});

/* ===== POSITION ===== */
function setPosition(){
const slideWidth = window.innerWidth;
currentTranslate=currentIndex*-slideWidth;
prevTranslate=currentTranslate;

sliderTrack.style.transition="transform 0.35s ease";
sliderTrack.style.transform=`translateX(${currentTranslate}px)`;
}

});