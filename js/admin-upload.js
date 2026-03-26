document.addEventListener("DOMContentLoaded", function(){

  const fileInput = document.getElementById("image");
  const captionContainer = document.getElementById("captionContainer");
  const progressBar = document.getElementById("uploadProgress");
  const progressText = document.getElementById("progressText");
  const overlay = document.getElementById("uploadOverlay");
  const uploadBtn = document.getElementById("uploadBtn");
  const form = document.getElementById("uploadForm");
  const passwordInput = document.getElementById("adminPassword");

  /* ===== DATE SET ===== */
  const now = new Date();
  const months = ["जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून","जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"];
  document.getElementById("month").value = months[now.getMonth()];
  document.getElementById("year").value = now.getFullYear();

  /* ===== IMAGE PREVIEW ===== */
  fileInput.addEventListener("change", function(){
    captionContainer.innerHTML = "";
    const files = fileInput.files;
    for(let i=0;i<files.length;i++){
      const file = files[i];
      const div = document.createElement("div");

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.width="80px";
      img.style.height="80px";
      img.style.objectFit="cover";
      div.appendChild(img);

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Caption लिहा";
      input.className = "captionInput";
      div.appendChild(input);

      captionContainer.appendChild(div);
    }
  });

  /* ===== PRE-CHECK PASSWORD & UPLOAD ===== */
  uploadBtn.addEventListener("click", async function(){

    const password = passwordInput.value.trim();
    const files = fileInput.files;

    if(files.length === 0){
      alert("फोटो निवडा 📷");
      return;
    }
    if(!password){
      alert("पासवर्ड टाका 🔐");
      return;
    }

    // 1️⃣ Pre-check password
    try {
      const check = await fetch("https://navnath-upload-server.onrender.com/check-password", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ password })
      });

      const result = await check.json();
      if(!result.valid){
        alert("❌ Wrong Password 🔐");
        passwordInput.value = "";
        return;
      }

      // ✅ Password correct → start upload
      startUpload(files, password);

    } catch(err){
      console.error(err);
      alert("❌ Network error");
    }

  });

  /* ===== UPLOAD FUNCTION ===== */
  function startUpload(files, password){
    const captions = document.querySelectorAll(".captionInput");
    const month = document.getElementById("month").value;
    const year = document.getElementById("year").value;

    const formData = new FormData();
    formData.append("password", password);
    formData.append("month", month);
    formData.append("year", year);

    for(let i=0;i<files.length;i++){
      formData.append("image", files[i]);
      formData.append("captions", captions[i]?.value || "");
    }

    overlay.style.display = "flex";
    progressBar.value = 0;
    progressText.innerText = "Uploading 0%";
    uploadBtn.disabled = true;

    const xhr = new XMLHttpRequest();
    xhr.open("POST","https://navnath-upload-server.onrender.com/upload");

    xhr.upload.onprogress = function(e){
      if(e.lengthComputable){
        const p = Math.round((e.loaded/e.total)*100);
        progressBar.value = p;
        progressText.innerText = "Uploading "+p+"%";
      }
    };

    xhr.onload = function(){
      uploadBtn.disabled = false;
      overlay.style.display = "none";

      if(xhr.status === 200){
        alert("✅ Upload success");
        form.reset();
        captionContainer.innerHTML = "";
        passwordInput.value = "";
        loadPhotos();
      } else {
        alert("❌ Upload failed");
        passwordInput.value = "";
      }
    };

    xhr.onerror = function(){
      uploadBtn.disabled = false;
      overlay.style.display = "none";
      alert("❌ Network error");
      passwordInput.value = "";
    };

    xhr.send(formData);
  }

  /* ===== LOAD PHOTOS ===== */
  function loadPhotos(){
    fetch("https://navnath-upload-server.onrender.com/gallery")
      .then(res => res.json())
      .then(data => {
        const photoList = document.getElementById("photo-list");
        photoList.innerHTML = "";
        data.forEach(img => {
          const box = document.createElement("div");
          box.style.display = "inline-block";
          box.style.margin = "10px";
          box.style.textAlign = "center";

          const image = document.createElement("img");
          image.src = img.secure_url || img.url;
          image.onerror = () => { image.src = "https://via.placeholder.com/120"; };
          image.style.width="120px";
          image.style.height="120px";
          image.style.objectFit="cover";

          const btn = document.createElement("button");
          btn.innerText = "🗑 Delete";
          btn.style.marginTop="5px";
          btn.onclick = async () => {
            const pass = prompt("Admin password टाका 🔐");
            if(!pass) return;

            try {
              const res = await fetch("https://navnath-upload-server.onrender.com/delete-photo", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({public_id:img.public_id,password:pass})
              });

              if(!res.ok){ alert("❌ Server error"); return; }

              const data = await res.json();
              if(data.success){
                alert("✅ Photo delete successful");
                loadPhotos();
              } else {
                alert("❌ Wrong Password 🔐");
              }

            } catch(err){
              console.error(err);
              alert("❌ Network error");
            }
          };

          box.appendChild(image);
          box.appendChild(btn);
          photoList.appendChild(box);
        });
      }).catch(err => console.error("Gallery error:", err));
  }

  loadPhotos();
});