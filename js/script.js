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
