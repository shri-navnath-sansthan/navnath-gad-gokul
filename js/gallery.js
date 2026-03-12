document.addEventListener("DOMContentLoaded", function () {

const cloudName = "djxhwbxah";
const folder = "gallery";

fetch(`https://res.cloudinary.com/${cloudName}/image/list/gallery.json`)
.then(res => res.json())
.then(data => {

const images = data.resources.map((img,index) => {

let caption = "";
let month = "Gallery";
let year = "";

if(img.context && img.context.custom){

caption = img.context.custom.caption || "";
month = img.context.custom.month || "Gallery";
year = img.context.custom.year || "";

}

return {

src:`https://res.cloudinary.com/${cloudName}/image/upload/${img.public_id}.${img.format}`,
month:month,
year:year,
caption:caption,
index:index

};

});

const galleryWrapper = document.getElementById("gallery-wrapper");
const modal = document.getElementById("modal");
const header = document.querySelector("header");

let currentIndex = 0;
let sliderTrack;
let modalCaption;
let modalCaptionText;
let readMoreBtn;
let isExpanded = false;

const COLLAPSED_HEIGHT = 40;

const grouped = {};

images.forEach((img, index) => {

const key = img.month + " " + img.year;

if (!grouped[key]) grouped[key] = [];

grouped[key].push({ ...img, index });

});

/* ===== MONTH SORT (NEWEST FIRST) ===== */

const sortedMonths = Object.keys(grouped).sort().reverse();

sortedMonths.forEach(monthKey => {

const monthTitle = document.createElement("h2");
monthTitle.className = "month-title";
monthTitle.innerText = monthKey;

const gallery = document.createElement("div");
gallery.className = "gallery";

grouped[monthKey].forEach(item => {

const img = document.createElement("img");

img.src = item.src;

img.onclick = () => openModal(item.index);

gallery.appendChild(img);

});

galleryWrapper.appendChild(monthTitle);
galleryWrapper.appendChild(gallery);

});

sliderTrack = document.createElement("div");

sliderTrack.classList.add("modal-track");

images.forEach(img => {

const image = document.createElement("img");

image.src = img.src;

sliderTrack.appendChild(image);

});

modalCaption = document.createElement("div");

modalCaption.style.position = "absolute";
modalCaption.style.bottom = "0";
modalCaption.style.left = "0";
modalCaption.style.width = "100%";
modalCaption.style.background = "#000000";
modalCaption.style.color = "#fff";
modalCaption.style.padding = "5px";
modalCaption.style.textAlign = "center";

modalCaptionText = document.createElement("div");

modalCaptionText.style.overflow = "hidden";
modalCaptionText.style.height = COLLAPSED_HEIGHT + "px";
modalCaptionText.style.transition = "height 0.3s ease";

readMoreBtn = document.createElement("div");

readMoreBtn.style.marginTop = "5px";
readMoreBtn.style.fontWeight = "bold";
readMoreBtn.style.cursor = "pointer";
readMoreBtn.innerText = "आणखी वाचा";

modalCaption.appendChild(modalCaptionText);
modalCaption.appendChild(readMoreBtn);

modal.appendChild(sliderTrack);
modal.appendChild(modalCaption);

function openModal(index){

currentIndex = index;

modal.style.display = "flex";

header.style.display = "none";

setPositionByIndex();

updateCaption();

history.pushState({ modalOpen: true }, "");

}

function updateCaption(){

modalCaptionText.innerText = images[currentIndex].caption;

modalCaptionText.style.height = COLLAPSED_HEIGHT + "px";

readMoreBtn.innerText = "आणखी वाचा";

isExpanded = false;

setTimeout(()=>{

if(modalCaptionText.scrollHeight > COLLAPSED_HEIGHT){

readMoreBtn.style.display="block";

}else{

readMoreBtn.style.display="none";

}

},50);

}

readMoreBtn.addEventListener("click",function(e){

e.stopPropagation();

if(!isExpanded){

modalCaptionText.style.height =
modalCaptionText.scrollHeight+"px";

readMoreBtn.innerText=" ";

isExpanded=true;

}else{

modalCaptionText.style.height =
COLLAPSED_HEIGHT+"px";

readMoreBtn.innerText="आणखी वाचा";

isExpanded=false;

}

});

function closeModal(){

modal.style.display="none";

header.style.display="block";

}

window.closeModal=closeModal;

modal.addEventListener("click",function(e){

if(e.target===modal) closeModal();

});

window.addEventListener("popstate",function(){

if(modal.style.display==="flex") closeModal();

});

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

setPositionByIndex();

updateCaption();

});

function setPositionByIndex(){

const slideWidth=modal.offsetWidth;

currentTranslate=currentIndex*-slideWidth;

prevTranslate=currentTranslate;

sliderTrack.style.transition="transform 0.35s ease";

sliderTrack.style.transform=`translateX(${currentTranslate}px)`;

}

});

});