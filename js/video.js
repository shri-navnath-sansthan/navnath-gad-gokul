document.addEventListener("DOMContentLoaded", function () {

    const videos = [
        {src: "videos/video1.mp4", month:"फेब्रुवारी", year:"2026"},
        {src: "videos/video2.mp4", month:"फेब्रुवारी", year:"2026"},
        {src: "videos/video3.mp4", month:"फेब्रुवारी", year:"2026"},
        {src: "videos/video4.mp4", month:"फेब्रुवारी", year:"2026"},
        {src: "videos/video5.mp4", month:"फेब्रुवारी", year:"2026"},
        {src: "videos/video6.mp4", month:"फेब्रुवारी", year:"2026"},
        {src: "videos/video7.mp4", month:"फेब्रुवारी", year:"2026"},
        {src: "videos/video8.mp4", month:"फेब्रुवारी", year:"2026"},
        {src: "videos/video9.mp4", month:"फेब्रुवारी", year:"2026"},
    ];

    const galleryWrapper = document.getElementById("videoGallery");
    const modal = document.getElementById("videoModal");
    const header = document.querySelector("header");

    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;

    /* ===== GROUP BY MONTH + YEAR ===== */
    const grouped = {};
    videos.forEach((vid, index) => {
        const key = vid.month + " " + vid.year;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({...vid, index});
    });

    Object.keys(grouped).forEach(monthKey => {
        const monthTitle = document.createElement("h2");
        monthTitle.className = "month-title";
        monthTitle.innerText = monthKey;

        const gallery = document.createElement("div");
        gallery.className = "video-gallery";

        grouped[monthKey].forEach(item => {
            const card = document.createElement("div");
            card.classList.add("video-card");

            const video = document.createElement("video");
            video.src = item.src;
            video.muted = true;
            video.playsInline = true;

            card.appendChild(video);

            // ❌ caption काढले आहेत

            gallery.appendChild(card);
            card.onclick = () => openVideo(item.index);
        });

        galleryWrapper.appendChild(monthTitle);
        galleryWrapper.appendChild(gallery);
    });

    /* ===== SLIDER TRACK ===== */
    const sliderTrack = document.createElement("div");
    sliderTrack.classList.add("modal-track");

    videos.forEach(item => {
        const video = document.createElement("video");
        video.src = item.src;
        video.controls = true;
        video.playsInline = true;
        sliderTrack.appendChild(video);
    });

    modal.appendChild(sliderTrack);

    /* ===== OPEN VIDEO ===== */
    function openVideo(index) {
        currentIndex = index;
        modal.style.display = "flex";
        header.style.display = "none";
        setPosition();
        history.pushState({modalOpen:true},"");
    }

    /* ===== CLOSE VIDEO ===== */
    function closeVideo() {
        modal.style.display = "none";
        header.style.display = "block";
        sliderTrack.querySelectorAll("video").forEach(v=>{
            v.pause();
            v.currentTime=0;
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

    /* ===== TOUCH SWIPE ===== */
    modal.addEventListener("touchstart", (e)=>{
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    modal.addEventListener("touchend", (e)=>{
        if(!isDragging) return;
        let endX = e.changedTouches[0].clientX;
        let diff = endX - startX;
        if(diff<-80 && currentIndex<videos.length-1) currentIndex++;
        if(diff>80 && currentIndex>0) currentIndex--;
        setPosition();
        isDragging=false;
    });

    /* ===== FIXED setPosition ===== */
    function setPosition(){
        sliderTrack.style.transition="transform 0.4s ease";
        sliderTrack.style.transform=`translateX(-${currentIndex*window.innerWidth}px)`;
        const allVideos=sliderTrack.querySelectorAll("video");
        allVideos.forEach((video,index)=>{
            video.pause();
            // ❌ currentTime reset काढलं
            if(index===currentIndex) video.play();
        });
    }

});