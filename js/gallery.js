document.addEventListener("DOMContentLoaded", function () {

    const API = "https://navnath-upload-server.onrender.com/gallery";

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

    /* =====================================================
       🔍 PINCH ZOOM
       ===================================================== */

    let zoomScale = 1;

    const MIN_ZOOM = 1;
    const MAX_ZOOM = 3;

    let pinchActive = false;
    let pinchStartDistance = 0;
    let pinchStartScale = 1;

    /* =====================================================
       👆 SWIPE
       ===================================================== */

    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    let isDragging = false;
    let touchMoved = false;

    /* =====================================================
       🚫 PREVENT ACCIDENTAL CLICK
       ===================================================== */

    let suppressClick = false;


    /* =====================================================
       📜 HISTORY SETUP
       ===================================================== */

    history.replaceState(
        { page: "home" },
        "",
        location.pathname
    );

    history.pushState(
        { page: "gallery" },
        "",
        "#gallery"
    );


    /* =====================================================
       📥 FETCH GALLERY
       ===================================================== */

    fetch(API)

        .then(res => res.json())

        .then(data => {

            if (skeleton) {
                skeleton.style.display = "none";
            }

            images = data.map((img, index) => {

                let caption = "";
                let month = "Gallery";
                let year = "";

                if (img.context) {

                    caption = img.context.caption || "";

                    month =
                        img.context.month ||
                        "Gallery";

                    year =
                        img.context.year ||
                        "";
                }

                const fastImage =
                    img.secure_url.replace(
                        "/upload/",
                        "/upload/f_auto,q_auto,w_800/"
                    );

                return {

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

        .catch(err => {

            console.log(
                "Gallery load error:",
                err
            );

        });


    /* =====================================================
       🔎 SEARCH
       ===================================================== */

    if (searchBox) {

        searchBox.addEventListener(
            "input",
            function () {

                const value =
                    this.value
                        .toLowerCase()
                        .trim();

                const filtered =
                    images.filter(img =>
                        img.caption
                            .toLowerCase()
                            .includes(value)
                    );

                renderGallery(filtered);

            }
        );

    }


    /* =====================================================
       🖼️ RENDER GALLERY
       ===================================================== */

    function renderGallery(imagesList) {

        galleryWrapper.innerHTML = "";

        const grouped = {};

        imagesList.forEach(img => {

            const key =
                img.month +
                " " +
                img.year;

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(img);

        });


        const monthOrder = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];


        Object.keys(grouped)

            .sort((a, b) => {

                const [
                    monthA,
                    yearA
                ] = a.split(" ");

                const [
                    monthB,
                    yearB
                ] = b.split(" ");


                if (yearA !== yearB) {

                    return yearB - yearA;

                }


                return (
                    monthOrder.indexOf(monthB) -
                    monthOrder.indexOf(monthA)
                );

            })

            .forEach(monthKey => {

                const monthTitle =
                    document.createElement("h2");

                monthTitle.className =
                    "month-title";

                monthTitle.innerText =
                    monthKey;


                const gallery =
                    document.createElement("div");

                gallery.className =
                    "gallery";


                grouped[monthKey].forEach(item => {

                    const image =
                        document.createElement("img");

                    image.src = item.src;

                    image.loading = "lazy";

                    image.alt =
                        item.caption ||
                        "नवनाथ गड गोकुळ फोटो";


                    image.onclick = function (e) {

                        e.preventDefault();
                        e.stopPropagation();

                        openModal(item.index);

                    };


                    gallery.appendChild(image);

                });


                galleryWrapper.appendChild(
                    monthTitle
                );

                galleryWrapper.appendChild(
                    gallery
                );

            });

    }


    /* =====================================================
       📸 CREATE MODAL
       ===================================================== */

    function createModal() {

        sliderTrack =
            document.createElement("div");

        sliderTrack.classList.add(
            "modal-track"
        );


        images.forEach(img => {

            const image =
                document.createElement("img");

            image.src =
                img.original;

            image.alt =
                img.caption ||
                "नवनाथ गड गोकुळ फोटो";

            image.draggable = false;

            image.style.transformOrigin =
                "center center";

            image.style.transition =
                "transform 0.15s ease";


            sliderTrack.appendChild(
                image
            );

        });


        /* =================================================
           📝 CAPTION
           ================================================= */

        modalCaption =
            document.createElement("div");

        modalCaption.className =
            "modal-caption";

        modalCaption.style.position =
            "absolute";

        modalCaption.style.bottom =
            "0";

        modalCaption.style.left =
            "0";

        modalCaption.style.width =
            "100%";

        modalCaption.style.background =
            "#000";

        modalCaption.style.color =
            "#fff";

        modalCaption.style.padding =
            "6px";

        modalCaption.style.textAlign =
            "center";


        modalCaptionText =
            document.createElement("div");

        modalCaptionText.style.overflow =
            "hidden";

        modalCaptionText.style.height =
            COLLAPSED_HEIGHT + "px";

        modalCaptionText.style.transition =
            "height 0.3s ease";


        /* =================================================
           📖 READ MORE
           ================================================= */

        readMoreBtn =
            document.createElement("div");

        readMoreBtn.style.marginTop =
            "4px";

        readMoreBtn.style.fontWeight =
            "bold";

        readMoreBtn.style.cursor =
            "pointer";

        readMoreBtn.innerText =
            "आणखी वाचा";


        readMoreBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();

                if (!isExpanded) {

                    modalCaptionText.style.height =
                        modalCaptionText.scrollHeight +
                        "px";

                    readMoreBtn.innerText =
                        "कमी करा";

                    isExpanded = true;

                } else {

                    modalCaptionText.style.height =
                        COLLAPSED_HEIGHT + "px";

                    readMoreBtn.innerText =
                        "आणखी वाचा";

                    isExpanded = false;

                }

            }
        );


        /* =================================================
           🔢 IMAGE COUNTER
           ================================================= */

        imageCounter =
            document.createElement("div");

        imageCounter.style.position =
            "absolute";

        imageCounter.style.top =
            "20px";

        imageCounter.style.left =
            "20px";

        imageCounter.style.color =
            "#fff";

        imageCounter.style.fontSize =
            "15px";

        imageCounter.style.background =
            "rgba(0,0,0,0.6)";

        imageCounter.style.padding =
            "5px 10px";

        imageCounter.style.borderRadius =
            "6px";


        modal.appendChild(
            imageCounter
        );

        modal.appendChild(
            sliderTrack
        );

        modalCaption.appendChild(
            modalCaptionText
        );

        modalCaption.appendChild(
            readMoreBtn
        );

        modal.appendChild(
            modalCaption
        );

    }


    /* =====================================================
       📂 OPEN MODAL
       ===================================================== */

    function openModal(index) {

        currentIndex = index;

        resetZoom();

        modal.style.display = "flex";

        if (header) {
            header.style.display = "none";
        }


        setTimeout(() => {

            setPositionByIndex();

            updateCaption();

        }, 30);


        history.pushState(
            { modalOpen: true },
            "",
            "#modal"
        );

    }


    /* =====================================================
       📝 UPDATE CAPTION
       ===================================================== */

    function updateCaption() {

        if (!images[currentIndex]) {
            return;
        }


        modalCaptionText.innerText =
            images[currentIndex].caption;


        imageCounter.innerText =
            (currentIndex + 1) +
            " / " +
            images.length;


        modalCaptionText.style.height =
            COLLAPSED_HEIGHT + "px";


        readMoreBtn.innerText =
            "आणखी वाचा";


        isExpanded = false;


        setTimeout(() => {

            if (
                modalCaptionText.scrollHeight >
                COLLAPSED_HEIGHT
            ) {

                readMoreBtn.style.display =
                    "block";

            } else {

                readMoreBtn.style.display =
                    "none";

            }

        }, 50);

    }


    /* =====================================================
       🔍 GET CURRENT IMAGE
       ===================================================== */

    function getCurrentImage() {

        if (!sliderTrack) {
            return null;
        }

        const allImages =
            sliderTrack.querySelectorAll("img");

        return allImages[currentIndex] || null;

    }


    /* =====================================================
       🔍 APPLY ZOOM
       ===================================================== */

    function applyZoom() {

        const currentImage =
            getCurrentImage();

        if (!currentImage) {
            return;
        }


        currentImage.style.transform =
            "translate3d(0,0,0) scale(" +
            zoomScale +
            ")";

    }


    /* =====================================================
       🔄 RESET ZOOM
       ===================================================== */

    function resetZoom() {

        zoomScale = 1;

        pinchActive = false;

        pinchStartDistance = 0;

        pinchStartScale = 1;


        if (!sliderTrack) {
            return;
        }


        const allImages =
            sliderTrack.querySelectorAll("img");


        allImages.forEach(img => {

            img.style.transform =
                "translate3d(0,0,0) scale(1)";

        });

    }


    /* =====================================================
       📏 PINCH DISTANCE
       ===================================================== */

    function getTouchDistance(touches) {

        const dx =
            touches[0].clientX -
            touches[1].clientX;

        const dy =
            touches[0].clientY -
            touches[1].clientY;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }


    /* =====================================================
       ❌ CLOSE MODAL
       ===================================================== */

    function closeModal() {

        resetZoom();

        modal.style.display =
            "none";

        if (header) {
            header.style.display =
                "block";
        }


        if (location.hash === "#modal") {

            history.back();

        }

    }


    window.closeModal =
        closeModal;


    /* =====================================================
       🖱️ MODAL CLICK
       ===================================================== */

    modal.addEventListener(
        "click",
        function (e) {

            if (suppressClick) {

                e.preventDefault();

                e.stopPropagation();

                suppressClick = false;

                return;

            }


            if (e.target === modal) {

                closeModal();

            }

        }
    );


    /* =====================================================
       👆 TOUCH START
       ===================================================== */

    modal.addEventListener(
        "touchstart",
        function (e) {

            /* PINCH START */

            if (e.touches.length === 2) {

                e.preventDefault();

                pinchActive = true;

                isDragging = false;

                pinchStartDistance =
                    getTouchDistance(
                        e.touches
                    );

                pinchStartScale =
                    zoomScale;

                return;

            }


            /* SINGLE FINGER */

            if (
                e.touches.length !== 1 ||
                pinchActive
            ) {

                return;

            }


            touchMoved = false;

            startX =
                e.touches[0].clientX;

            isDragging = true;

            sliderTrack.style.transition =
                "none";

        },
        { passive: false }
    );


    /* =====================================================
       👆 TOUCH MOVE
       ===================================================== */

    modal.addEventListener(
        "touchmove",
        function (e) {

            /* PINCH ZOOM */

            if (
                pinchActive &&
                e.touches.length === 2
            ) {

                e.preventDefault();

                const currentDistance =
                    getTouchDistance(
                        e.touches
                    );


                if (
                    pinchStartDistance <= 0
                ) {

                    return;

                }


                zoomScale =
                    pinchStartScale *
                    (
                        currentDistance /
                        pinchStartDistance
                    );


                zoomScale =
                    Math.max(
                        MIN_ZOOM,
                        Math.min(
                            MAX_ZOOM,
                            zoomScale
                        )
                    );


                applyZoom();

                return;

            }


            /* DON'T SWIPE WHILE ZOOMED */

            if (zoomScale > 1) {

                return;

            }


            if (
                !isDragging ||
                e.touches.length !== 1
            ) {

                return;

            }


            e.preventDefault();


            const currentX =
                e.touches[0].clientX;


            const diff =
                currentX - startX;


            if (Math.abs(diff) > 10) {

                touchMoved = true;

            }


            currentTranslate =
                prevTranslate + diff;


            sliderTrack.style.transform =
                "translate3d(" +
                currentTranslate +
                "px,0,0)";

        },
        { passive: false }
    );


    /* =====================================================
       👆 TOUCH END
       ===================================================== */

    modal.addEventListener(
        "touchend",
        function (e) {

            /* PINCH FINISHED */

            if (
                pinchActive &&
                e.touches.length < 2
            ) {

                pinchActive = false;

                if (zoomScale < 1.05) {

                    resetZoom();

                }


                /* Prevent accidental click */

                suppressClick = true;

                setTimeout(() => {

                    suppressClick = false;

                }, 350);


                return;

            }


            if (!isDragging) {

                return;

            }


            isDragging = false;


            /* SIMPLE TAP */

            if (!touchMoved) {

                suppressClick = true;

                setTimeout(() => {

                    suppressClick = false;

                }, 350);

                return;

            }


            /* DON'T CHANGE PHOTO WHILE ZOOMED */

            if (zoomScale > 1) {

                return;

            }


            const movedBy =
                currentTranslate -
                prevTranslate;


            /* SWIPE LEFT */

            if (
                movedBy < -80 &&
                currentIndex <
                images.length - 1
            ) {

                currentIndex++;

            }


            /* SWIPE RIGHT */

            if (
                movedBy > 80 &&
                currentIndex > 0
            ) {

                currentIndex--;

            }


            resetZoom();

            setPositionByIndex();

            updateCaption();


            suppressClick = true;

            setTimeout(() => {

                suppressClick = false;

            }, 350);

        },
        { passive: false }
    );


    /* =====================================================
       🚫 TOUCH CANCEL
       ===================================================== */

    modal.addEventListener(
        "touchcancel",
        function () {

            isDragging = false;

            pinchActive = false;

            resetZoom();

            setPositionByIndex();

        }
    );


    /* =====================================================
       📐 PERFECT PHOTO POSITION
       ===================================================== */

    function setPositionByIndex() {

        if (!sliderTrack) {
            return;
        }


        const slideWidth =
            modal.getBoundingClientRect().width;


        const allImages =
            sliderTrack.querySelectorAll("img");


        /* प्रत्येक photo ला exact screen width */

        allImages.forEach(img => {

            img.style.width =
                slideWidth + "px";

            img.style.flex =
                "0 0 " +
                slideWidth +
                "px";

        });


        /* पूर्ण slider width */

        sliderTrack.style.width =
            (
                slideWidth *
                images.length
            ) +
            "px";


        currentTranslate =
            currentIndex *
            -slideWidth;


        prevTranslate =
            currentTranslate;


        sliderTrack.style.transition =
            "transform 0.35s cubic-bezier(0.22,0.61,0.36,1)";


        sliderTrack.style.transform =
            "translate3d(" +
            currentTranslate +
            "px,0,0)";

    }


    /* =====================================================
       📱 RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            if (
                modal.style.display ===
                "flex"
            ) {

                setPositionByIndex();

            }

        }
    );

});