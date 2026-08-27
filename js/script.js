const slides = document.querySelectorAll(".slide");
const slider = document.getElementById("slider");
const progress = document.querySelector(".progress");
const caption = document.getElementById("caption");
const dotsContainer = document.getElementById("dots");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playPause = document.getElementById("playPause");

let current = 0;
let interval;
let startX = 0;
let isPaused = false;
let lastTap = 0; // 🔥 double tap detection

/* HEIGHT */
function adjustFrame(img) {
  const ratio = img.naturalHeight / img.naturalWidth;
  slider.style.height = (slider.offsetWidth * ratio) + "px";
}

slides.forEach(img => {
  img.onload = () => {
    if (img.classList.contains("active")) {
      adjustFrame(img);
    }
  };
});

/* DOTS */
slides.forEach((_, i) => {
  const dot = document.createElement("span");
  dot.classList.add("dot");
  dot.onclick = () => goToSlide(i);
  dotsContainer.appendChild(dot);
});

function updateDots(){
  document.querySelectorAll(".dot").forEach((d,i)=>{
    d.classList.toggle("active", i === current);
  });
}

/* GO TO */
function goToSlide(index){
  slides[current].classList.remove("active");
  current = index;
  slides[current].classList.add("active");

  adjustFrame(slides[current]);
  updateCaption();
  updateDots();
  resetProgress();
}

/* CAPTION */
function updateCaption(){
  caption.classList.remove("show");

  setTimeout(()=>{
    caption.innerText = slides[current].getAttribute("data-caption") || "";
    caption.classList.add("show");
  },150);
}

/* PROGRESS */
function resetProgress(){
  progress.style.width = "0%";
  progress.style.transition = "none";

  setTimeout(()=>{
    progress.style.transition = "width 3.7s linear";
    progress.style.width = "100%";
  },50);
}

/* SLIDER */
function runSlider(){
  slides[current].classList.remove("active");
  slides[current].classList.add("exit");

  let next = (current + 1) % slides.length;
  slides[next].classList.add("active");

  adjustFrame(slides[next]);

  setTimeout(() => {
    slides[current].classList.remove("exit");
    current = next;

    updateCaption();
    updateDots();
    resetProgress();

  }, 800);
}

function prevSlide(){
  slides[current].classList.remove("active");

  current = (current - 1 + slides.length) % slides.length;

  slides[current].classList.add("active");

  adjustFrame(slides[current]);
  updateCaption();
  updateDots();
  resetProgress();
}

/* AUTO */
function startSlider(){
  stopSlider();
  interval = setInterval(runSlider, 1750);
  resetProgress();
}

function stopSlider(){
  if(interval) clearInterval(interval);
}

/* INIT */
startSlider();
updateCaption();
updateDots();

/* 🔥 PLAY / PAUSE */
function togglePlayPause(){

  if(isPaused){
    startSlider();
    playPause.innerText = "⏸";
  } else {
    stopSlider();
    playPause.innerText = "▶";
  }

  playPause.classList.add("show");

  setTimeout(()=>{
    playPause.classList.remove("show");
  },800);

  isPaused = !isPaused;
}

/* 📱 DOUBLE TAP (mobile only) */
slider.addEventListener("touchend", (e)=>{
  let currentTime = new Date().getTime();
  let tapLength = currentTime - lastTap;

  if(tapLength < 300 && tapLength > 0){
    togglePlayPause(); // 🔥 double tap detected
  }

  lastTap = currentTime;
});

/* 💻 HOVER */
slider.addEventListener("mouseenter", ()=>{
  stopSlider();
  playPause.innerText = "▶";
  playPause.classList.add("show");
});

slider.addEventListener("mouseleave", ()=>{
  if(!isPaused) startSlider();
  playPause.innerText = "⏸";

  setTimeout(()=>{
    playPause.classList.remove("show");
  },600);
});

/* SWIPE */
slider.addEventListener("touchstart", (e)=>{
  startX = e.touches[0].clientX;
});

slider.addEventListener("touchend", (e)=>{
  let endX = e.changedTouches[0].clientX;
  let diff = startX - endX;

  if(diff > 50){
    runSlider();
  }
  else if(diff < -50){
    prevSlide();
  }
});

/* BUTTONS */
if(prevBtn && nextBtn){
  prevBtn.onclick = ()=>{
    stopSlider();
    prevSlide();
    if(!isPaused) startSlider();
  };

  nextBtn.onclick = ()=>{
    stopSlider();
    runSlider();
    if(!isPaused) startSlider();
  };
}

/* TAB */
document.addEventListener("visibilitychange", ()=>{
  if(document.hidden){
    stopSlider();
  } else {
    if(!isPaused) startSlider();
  }
});
















/* ==========================================
   🌿 Premium Quote Animation
   Shri Navnath Gad
========================================== */

const quotes = [
"🌳 झाडे लावा, झाडे जगवा; कारण निसर्गच जीवनाचा खरा आधार आहे.",
"🌱 आज लावलेले एक रोप उद्याच्या पिढीला शुद्ध श्वास देईल.",
"🍃 निसर्गाचे रक्षण म्हणजे स्वतःच्या भविष्याचे रक्षण.",
"🌿 झाडांची सावली ही निसर्गाची नि:स्वार्थ भेट आहे.",
"🌍 पृथ्वी आपली नाही; आपण पृथ्वीचे आहोत.",
"💚 प्रत्येक झाड म्हणजे हजारो जीवांना मिळणारा जीवनाचा आधार.",
"🌳 वृक्षतोड थांबवा, वृक्षसंवर्धन वाढवा.",
"🌱 एक झाड लावा आणि पृथ्वीच्या चेहऱ्यावर हास्य फुलवा.",
"🍀 हिरवाई वाढेल तेव्हा जीवनही फुलेल.",
"🌿 निसर्ग वाचवणे ही प्रत्येक नागरिकाची जबाबदारी आहे.",
"🌱 पाणी, माती आणि वृक्ष हेच जीवनाचे तीन आधारस्तंभ आहेत.",
"🌍 स्वच्छ पर्यावरण म्हणजे निरोगी जीवन.",
"🍃 प्रत्येक रोपात भविष्यातील हिरवाई दडलेली असते.",
"🌳 झाडे लावणे म्हणजे पुढील पिढीसाठी ठेवलेली अमूल्य ठेव आहे.",
"🌿 निसर्गावर प्रेम करा; तोच तुमचा खरा मित्र आहे.",
"🌱 एक वृक्ष हजारो श्वासांचे रक्षण करतो.",
"🍀 हिरवी पृथ्वी हीच खरी समृद्धी आहे.",
"🌍 निसर्गाशी मैत्री करा; भविष्य सुरक्षित करा.",
"🌳 आजचे संवर्धन, उद्याचे सुंदर जीवन.",
"🌱 प्रत्येक झाड जीवनाचा नवीन श्वास आहे.",
"🍃 निसर्ग आपल्याला सर्व काही देतो; त्याला जपा.",
"🌿 झाडे लावा, दुष्काळ हटवा.",
"🌳 हिरवाई म्हणजे पृथ्वीचे सौंदर्य.",
"🌱 झाडांची सेवा म्हणजे मानवतेची सेवा.",
"🌍 स्वच्छ हवा प्रत्येकाचा हक्क आहे.",
"🍀 झाडे वाचवा, जीवन वाचवा.",
"🌳 पर्यावरण वाचवा, पृथ्वी सजवा.",
"🌱 एक झाड म्हणजे हजारो आशा.",
"🌿 झाडे नसतील तर उद्याचा श्वासही नसेल.",
"🍃 पाणी वाचवा, भविष्य वाचवा.",
"🌳 प्रत्येक रोप उद्याचा विशाल वृक्ष आहे.",
"🌍 निसर्गाची कदर करा; तोच जीवनाचा आधार आहे.",
"🌱 झाडे लावणारा खरा समाजसेवक असतो.",
"🍀 हिरवाई हीच पृथ्वीची खरी श्रीमंती आहे.",
"🌿 झाडे म्हणजे पृथ्वीचे दागिने आहेत.",
"🌳 निसर्गाचा आदर करा; निसर्ग तुमचे रक्षण करेल.",
"🌱 प्रत्येक झाड पृथ्वीला नवा श्वास देते.",
"🍃 वृक्षसंवर्धन म्हणजे भविष्यातील गुंतवणूक.",
"🌍 स्वच्छ परिसर, सुंदर जीवन.",
"🌳 झाडे लावूया, पर्यावरण वाचवूया.",
"🌿 हिरवागार निसर्ग म्हणजे निरोगी समाज.",
"🌱 झाडे जगली तरच माणूस जगेल.",
"🍀 प्रत्येक झाडात जीवन दडलेले आहे.",
"🌳 पृथ्वी हिरवी तर भविष्य उज्ज्वल.",
"🌍 वृक्ष म्हणजे जीवनाचा आधार.",
"🌱 झाडे वाढवा, प्रदूषण कमी करा.",
"🍃 निसर्ग जपणे हीच खरी संस्कृती आहे.",
"🌿 वृक्षलागवड ही सर्वोत्तम सेवा आहे.",
"🌳 झाडे म्हणजे निसर्गाची मंदिरे.",
"🌱 हिरवाईतच आनंद दडलेला आहे.",
"🌍 निसर्गाचे संतुलन राखा.",
"🍀 एक झाड लाखो आनंद देते.",
"🌳 वृक्ष म्हणजे जीवनदाते.",
"🌿 हिरवळ म्हणजे सुखाचे प्रतीक.",
"🌱 झाडांशिवाय जीवन अपूर्ण आहे.",
"🍃 पाणी म्हणजे जीवन; त्याची बचत करा.",
"🌍 निसर्ग हा सर्वोत्तम गुरु आहे.",
"🌳 वृक्ष म्हणजे पृथ्वीचे रक्षणकर्ते.",
"🌱 हिरवीगार पृथ्वी आपली जबाबदारी आहे.",
"🍀 झाडे म्हणजे शुद्ध हवेचा कारखाना.",
"🌿 झाडे वाढवा, उष्णता कमी करा.",
"🌳 निसर्गाची सेवा म्हणजे राष्ट्रसेवा.",
"🌱 प्रत्येक पान जीवनाची गोष्ट सांगते.",
"🍃 वृक्षांचे रक्षण करा; ते तुमचे रक्षण करतील.",
"🌍 पृथ्वीला हिरवा श्वास द्या.",
"🌳 झाडे म्हणजे भविष्यातील संपत्ती.",
"🌿 पर्यावरण संवर्धन ही काळाची गरज आहे.",
"🌱 निसर्ग जपला तरच भविष्य उज्ज्वल होईल.",
"🍀 हिरवाई हीच खरी प्रगती आहे.",
"🌳 झाडे म्हणजे आशेची सावली.",
"🌍 पृथ्वीचा सन्मान करा.",
"🌱 झाडे म्हणजे उद्याची सुरक्षा.",
"🍃 निसर्ग वाचवा, संस्कृती जपा.",
"🌿 प्रत्येक झाड पृथ्वीचे सौंदर्य वाढवते.",
"🌳 झाडे म्हणजे जीवनाची कवच-कुंडले.",
"🌱 निसर्गावर प्रेम करा, जीवन सुंदर करा.",
"🍀 वृक्षलागवड म्हणजे भविष्यातील आनंद.",
"🌍 स्वच्छ पृथ्वी, सुंदर भविष्य.",
"🌳 झाडे म्हणजे निसर्गाचे अमूल्य धन.",
"🌿 हिरवाई हीच पृथ्वीची ओळख.",
"🌱 प्रत्येक रोपात आशेचा किरण असतो.",
"🍃 झाडे वाढवा, जीवन फुलवा.",
"🌍 पर्यावरण म्हणजेच आपले घर.",
"🌳 निसर्ग जपा; पृथ्वी हसेल.",
"🌱 झाडे म्हणजे अमूल्य वारसा.",
"🍀 पाणी आणि झाडे हेच जीवन.",
"🌿 वृक्ष म्हणजे मानवाचा खरा मित्र.",
"🌳 निसर्गाची साथ म्हणजे जीवनाची ताकद.",
"🌱 हिरवाईतच खरे सौंदर्य आहे.",
"🍃 झाडे लावा; भवितव्य उजळवा.",
"🌍 पृथ्वीला हिरवा स्पर्श द्या.",
"🌳 प्रत्येक वृक्ष एक जीवनदाता आहे.",
"🌿 निसर्ग वाचवा; आनंद वाढवा.",
"🌱 झाडे म्हणजे पृथ्वीचे हृदय.",
"🍀 झाडे वाढली तर भविष्य फुलेल.",
"🌳 हिरवागार निसर्ग म्हणजे खरा विकास.",
"🌍 पृथ्वीचे सौंदर्य जपणे हे आपले कर्तव्य आहे.",
"🌱 झाडे म्हणजे प्रत्येक पिढीसाठी दिलेली अमूल्य भेट.",
"🌿 निसर्ग जपा; जीवन समृद्ध करा.",
"🌳 झाडे लावा, पृथ्वी वाचवा, भविष्य घडवा."
];
const quote = document.getElementById("quote-text");

// वेबसाइट सुरू झाल्याची तारीख (हवी असल्यास बदला)
const startTime = new Date("2026-01-01T00:00:00").getTime();

// प्रत्येक 5 सेकंदांनी बदल
const CHANGE_INTERVAL = 4000;

// सध्याचा Quote Index काढा
function getQuoteIndex() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / CHANGE_INTERVAL);
    return elapsed % quotes.length;
}

let index = getQuoteIndex();

quote.textContent = quotes[index];
quote.classList.add("show");

function changeQuote() {

    const newIndex = getQuoteIndex();

    if (newIndex === index) return;

    index = newIndex;

    quote.classList.remove("show");
    quote.classList.add("hide");

    setTimeout(() => {

        quote.textContent = quotes[index];

        quote.classList.remove("hide");
        quote.classList.add("show");

    }, 500);

}

// दर अर्ध्या सेकंदाला तपासेल,
// पण Quote फक्त 5 सेकंदांनीच बदलेल.
setInterval(changeQuote, 500);