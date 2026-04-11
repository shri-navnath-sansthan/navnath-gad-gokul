document.addEventListener("DOMContentLoaded", function () {

    const API = "https://navnath-upload-server.onrender.com/videos";

    const galleryWrapper = document.getElementById("videoGallery");
    const modal = document.getElementById("videoModal");
    const header = document.querySelector("header");

    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;

    let videos = [];

    /* ================= SKELETON ================= */

    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-grid";

    for(let i=0;i<12;i++){
        const box = document.createElement("div");
        box.className = "skeleton-box";
        skeleton.appendChild(box);
    }

    galleryWrapper.appendChild(skeleton);

    /* ================= FETCH ================= */

    fetch(API)
    .then(res => res.json())
    .then(data => {

        galleryWrapper.innerHTML = "";

        videos = data.map((vid, index) => ({
            src: vid.secure_url.replace("/upload/", "/upload/f_auto,q_auto/"),
            month: vid.context?.month || "Gallery",
            year: vid.context?.year || "",
            index: index
        }));

        renderGallery();
        createSlider();

    })
    .catch(err=>{
        console.log("Video load error",err);
    });

    /* ================= RENDER ================= */

    function renderGallery(){

        const grouped = {};

        videos.forEach((vid) => {
            const key = vid.month + " " + vid.year;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(vid);
        });

        // ✅ 🔥 FIXED SORTING
        const monthOrder = {
          January:1, February:2, March:3, April:4, May:5, June:6,
          July:7, August:8, September:9, October:10, November:11, December:12
        };

        Object.keys(grouped)
        .sort((a,b)=>{
            const [m1,y1] = a.split(" ");
            const [m2,y2] = b.split(" ");

            if (y1 !== y2) return y2 - y1;

            return monthOrder[m2] - monthOrder[m1];
        })
        .forEach(monthKey => {

            const monthTitle = document.createElement("h2");
            monthTitle.className = "month-title";
            monthTitle.innerText = monthKey;

            const gallery = document.createElement("div");
            gallery.className = "video-gallery";

            grouped[monthKey].forEach((item,i) => {

                const card = document.createElement("div");
                card.classList.add("video-card");

                const video = document.createElement("video");

                video.src = item.src;
                video.muted = true;
                video.playsInline = true;
                video.preload = "metadata";

                card.appendChild(video);

                card.onclick = () => openVideo(item.index);

                gallery.appendChild(card);

                setTimeout(()=>{
                    card.classList.add("show");
                }, i * 80);

            });

            galleryWrapper.appendChild(monthTitle);
            galleryWrapper.appendChild(gallery);

        });

    }

    /* ================= SLIDER ================= */

    let sliderTrack;

    function createSlider(){

        sliderTrack = document.createElement("div");
        sliderTrack.classList.add("modal-track");

        videos.forEach(item => {

            const video = document.createElement("video");
            video.src = item.src;
            video.controls = true;
            video.playsInline = true;

            sliderTrack.appendChild(video);

        });

        modal.appendChild(sliderTrack);
    }

    /* ================= OPEN ================= */

    function openVideo(index) {
        currentIndex = index;
        modal.style.display = "flex";
        header.style.display = "none";
        setPosition();
        history.pushState({modalOpen:true},"");
    }

    /* ================= CLOSE ================= */

    function closeVideo() {
        modal.style.display = "none";
        header.style.display = "block";

        sliderTrack.querySelectorAll("video").forEach(v=>{
            v.pause();
            v.currentTime = 0;
        });
    }

    modal.addEventListener("click", function(e){
        if(e.target===modal){
            closeVideo();
            history.back();
        }
    });

    window.addEventListener("popstate", function(){
        if(modal.style.display==="flex") closeVideo();
    });

    /* ================= SWIPE ================= */

    modal.addEventListener("touchstart", (e)=>{
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    modal.addEventListener("touchend", (e)=>{
        if(!isDragging) return;

        let endX = e.changedTouches[0].clientX;
        let diff = endX - startX;

        if(diff < -80 && currentIndex < videos.length-1) currentIndex++;
        if(diff > 80 && currentIndex > 0) currentIndex--;

        setPosition();
        isDragging=false;
    });

    /* ================= POSITION ================= */

    function setPosition(){

        sliderTrack.style.transition="transform 0.4s ease";
        sliderTrack.style.transform=`translateX(-${currentIndex*window.innerWidth}px)`;

        const allVideos = sliderTrack.querySelectorAll("video");

        allVideos.forEach((video,index)=>{
            video.pause();
            if(index===currentIndex) video.play();
        });

    }

});