/* ===== Render Server Ping ===== */
/* server: :contentReference[oaicite:0]{index=0} */

function pingServer(){
fetch("https://navnath-upload-server.onrender.com/gallery")
.then(()=>console.log("Render server active"))
.catch(()=>console.log("Ping failed"));
}

/* ⭐ page open होताच request */
pingServer();

/* ⭐ 12 मिनिटांनी request */
setInterval(pingServer,720000);



/* ===== Slider Script ===== */

const slides = document.querySelectorAll(".slide");
const slider = document.getElementById("slider");
let current = 0;

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

setInterval(() => {
  slides[current].classList.remove("active");
  slides[current].classList.add("exit");

  let next = (current + 1) % slides.length;
  slides[next].classList.add("active");
  adjustFrame(slides[next]);

  setTimeout(() => {
    slides[current].classList.remove("exit");
    current = next;
  }, 800);
}, 3700);



