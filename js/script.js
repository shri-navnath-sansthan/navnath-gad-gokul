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
  interval = setInterval(runSlider, 3700);
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