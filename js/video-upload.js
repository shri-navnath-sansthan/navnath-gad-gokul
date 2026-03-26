document.addEventListener("DOMContentLoaded", function(){

  const videoInput = document.getElementById("video");
  const uploadBtn = document.getElementById("uploadVideoBtn");
  const progressBar = document.getElementById("uploadProgress");
  const progressText = document.getElementById("progressText");
  const overlay = document.getElementById("uploadOverlay");
  const passwordInput = document.getElementById("videoPassword");

  /* DATE SET */
  const now = new Date();
  const months = ["जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून","जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"];
  document.getElementById("videoMonth").value = months[now.getMonth()];
  document.getElementById("videoYear").value = now.getFullYear();

  /* PRE-CHECK PASSWORD & UPLOAD VIDEO */
  uploadBtn.addEventListener("click", async function(){

    const password = passwordInput.value.trim();
    const files = videoInput.files;

    if(files.length === 0){ alert("व्हिडिओ निवडा 📹"); return; }
    if(!password){ alert("पासवर्ड टाका 🔐"); return; }

    // Password pre-check
    try{
      const res = await fetch("https://navnath-upload-server.onrender.com/check-password", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ password })
      });
      const data = await res.json();
      if(!data.valid){ alert("❌ Wrong Password 🔐"); passwordInput.value=""; return; }

      // Start upload
      startUpload(files, password);

    } catch(err){
      console.error(err);
      alert("❌ Network error");
    }
  });

  function startUpload(files, password){
    const formData = new FormData();
    formData.append("password", password);
    for(let f of files){ formData.append("video", f); }
    formData.append("month", document.getElementById("videoMonth").value);
    formData.append("year", document.getElementById("videoYear").value);

    overlay.style.display="flex";
    progressBar.value = 0;
    progressText.innerText="Uploading 0%";
    uploadBtn.disabled=true;

    const xhr = new XMLHttpRequest();
    xhr.open("POST","https://navnath-upload-server.onrender.com/upload-video");

    xhr.upload.onprogress = function(e){
      if(e.lengthComputable){
        let p = Math.round((e.loaded/e.total)*100);
        progressBar.value = p;
        progressText.innerText = "Uploading "+p+"%";
      }
    };

    xhr.onload = function(){
      overlay.style.display="none";
      uploadBtn.disabled=false;

      if(xhr.status===200){
        alert("✅ Upload success");
        formReset();
        loadVideos();
      } else {
        alert("❌ Upload failed");
        formReset();
      }
    };

    xhr.onerror = function(){
      overlay.style.display="none";
      uploadBtn.disabled=false;
      alert("❌ Network error");
      formReset();
    };

    xhr.send(formData);
  }

  function formReset(){
    videoInput.value = "";
    passwordInput.value = "";
    progressBar.value = 0;
    progressText.innerText="Uploading 0%";
  }

  function loadVideos(){
    fetch("https://navnath-upload-server.onrender.com/videos")
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById("video-list");
        list.innerHTML = "";

        data.forEach(v => {
          const box = document.createElement("div");

          const video = document.createElement("video");
          video.src = v.secure_url;
          video.controls=true;
          video.style.width="240px";
          video.style.height="135px";
          video.style.display="block";
          video.style.marginBottom="5px";

          const btn = document.createElement("button");
          btn.innerText="🗑 Delete";
          btn.onclick = async () => {
            const pass = prompt("Admin password टाका 🔐");
            if(!pass) return;
            try{
              const res = await fetch("https://navnath-upload-server.onrender.com/delete-video", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({public_id:v.public_id,password:pass})
              });
              const d = await res.json();
              if(d.success){ alert("✅ Video delete successful"); loadVideos(); }
              else { alert("❌ Wrong Password 🔐"); }
            } catch(err){ console.error(err); alert("❌ Network error"); }
          };

          box.appendChild(video);
          box.appendChild(btn);
          list.appendChild(box);
        });
      }).catch(err => { console.error(err); alert("❌ Could not load videos"); });
  }

  loadVideos();
});