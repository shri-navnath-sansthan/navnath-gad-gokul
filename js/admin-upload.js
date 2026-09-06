document.addEventListener("DOMContentLoaded", function(){

/* =====================================================
   🌐 SERVER
   ===================================================== */

const SERVER = "https://navnath-upload-server.onrender.com";


/* =====================================================
   📅 DATE
   ===================================================== */

const now = new Date();

const months = [
  "जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून",
  "जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"
];

document.getElementById("month").value =
  months[now.getMonth()];

document.getElementById("year").value =
  now.getFullYear();


/* =====================================================
   🔹 ELEMENTS
   ===================================================== */

const fileInput =
  document.getElementById("image");

const captionContainer =
  document.getElementById("captionContainer");

const progressBar =
  document.getElementById("uploadProgress");

const progressText =
  document.getElementById("progressText");

const overlay =
  document.getElementById("uploadOverlay");

const uploadBtn =
  document.getElementById("uploadBtn");


/* =====================================================
   🖼️ IMAGE PREVIEW
   ===================================================== */

fileInput.addEventListener("change", function(){

  captionContainer.innerHTML = "";

  const files = fileInput.files;

  for(let i = 0; i < files.length; i++){

    const file = files[i];

    const div =
      document.createElement("div");

    const img =
      document.createElement("img");

    img.src =
      URL.createObjectURL(file);

    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";

    div.appendChild(img);


    const input =
      document.createElement("input");

    input.type = "text";

    input.placeholder =
      "Enter caption";

    input.className =
      "captionInput";

    div.appendChild(input);

    captionContainer.appendChild(div);

  }

});


/* =====================================================
   📤 UPLOAD PHOTOS
   ===================================================== */

const form =
  document.getElementById("uploadForm");

form.addEventListener("submit", async function(e){

  e.preventDefault();

  const passwordInput =
    document.getElementById("adminPassword");

  const password =
    passwordInput.value;

  const files =
    fileInput.files;


  if(files.length === 0){

    alert("Select photos 📷");

    return;

  }


  if(!password){

    alert("Enter password 🔐");

    return;

  }


  /* =====================================================
     🔐 PASSWORD CHECK
     ===================================================== */

  overlay.style.display = "flex";

  progressBar.value = 0;

  progressText.innerText =
    "🔐 Checking password...";


  try{

    const verifyRes =
      await fetch(
        `${SERVER}/verify-password`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({
            password:password
          })
        }
      );


    if(verifyRes.status === 401){

      progressText.innerText =
        "❌ Wrong Password";

      setTimeout(
        () =>
          overlay.style.display = "none",
        1200
      );

      return;

    }


    if(!verifyRes.ok){

      throw new Error(
        "Password verification failed"
      );

    }

  }catch(err){

    overlay.style.display = "none";

    alert(
      "❌ Server verify error"
    );

    return;

  }


  /* =====================================================
     📤 START UPLOAD
     ===================================================== */

  progressText.innerText =
    "Uploading 0%";

  progressBar.value = 0;

  uploadBtn.disabled = true;


  const captions =
    document.querySelectorAll(
      ".captionInput"
    );

  const month =
    document.getElementById("month").value;

  const year =
    document.getElementById("year").value;


  const formData =
    new FormData();


  formData.append(
    "password",
    password
  );

  formData.append(
    "month",
    month
  );

  formData.append(
    "year",
    year
  );


  for(let i = 0; i < files.length; i++){

    formData.append(
      "image",
      files[i]
    );

    formData.append(
      "captions",
      captions[i]?.value || ""
    );

  }


  const xhr =
    new XMLHttpRequest();


  xhr.open(
    "POST",
    `${SERVER}/upload`
  );


  /* =====================================================
     📊 UPLOAD PROGRESS
     ===================================================== */

  xhr.upload.onprogress =
    function(e){

      if(
        e.lengthComputable &&
        e.total > 0
      ){

        const percent =
          Math.round(
            (e.loaded / e.total) * 100
          );

        progressBar.value =
          percent;

        progressText.innerText =
          "Uploading " +
          percent +
          "%";

      }else{

        progressText.innerText =
          "Uploading...";

      }

    };


  /* =====================================================
     ✅ UPLOAD COMPLETE
     ===================================================== */

  xhr.onload =
    function(){

      uploadBtn.disabled = false;

      overlay.style.display =
        "none";


      if(xhr.status === 200){

        alert(
          "✅ Upload successful"
        );


        const savedPassword =
          passwordInput.value;


        form.reset();

        captionContainer.innerHTML =
          "";


        passwordInput.value =
          savedPassword;


        loadPhotos();

      }else{

        alert(
          "❌ Upload failed"
        );

      }

    };


  /* =====================================================
     ❌ NETWORK ERROR
     ===================================================== */

  xhr.onerror =
    function(){

      overlay.style.display =
        "none";

      uploadBtn.disabled =
        false;

      alert(
        "❌ Network error"
      );

    };


  xhr.send(formData);

});


/* =====================================================
   📸 LOAD APPROVED / NORMAL PHOTOS
   ===================================================== */

function loadPhotos(){

  fetch(
    `${SERVER}/gallery`
  )

  .then(res => res.json())

  .then(data => {

    const photoList =
      document.getElementById(
        "photo-list"
      );

    photoList.innerHTML = "";


    if(
      !Array.isArray(data) ||
      data.length === 0
    ){

      photoList.innerHTML =
        "<p>📭 No photos found.</p>";

      return;

    }


    data.forEach(img => {

      const box =
        document.createElement("div");

      box.style.display =
        "inline-block";

      box.style.margin =
        "10px";

      box.style.textAlign =
        "center";


      const image =
        document.createElement("img");

      image.src =
        img.secure_url ||
        img.url;


      image.onerror =
        () => {

          image.src =
            "https://via.placeholder.com/120";

        };


      image.style.width =
        "120px";

      image.style.height =
        "120px";

      image.style.objectFit =
        "cover";


      const btn =
        document.createElement("button");

      btn.innerText =
        "🗑 Delete";

      btn.style.marginTop =
        "5px";


      btn.onclick =
        () =>
          deletePhoto(
            img.public_id
          );


      box.appendChild(image);

      box.appendChild(btn);

      photoList.appendChild(box);

    });

  })

  .catch(err => {

    console.error(
      "Gallery error:",
      err
    );

  });

}


/* =====================================================
   📥 LOAD PENDING PHOTOS
   ===================================================== */

async function loadPendingPhotos(){

  const pendingList =
    document.getElementById(
      "pending-list"
    );

  const pendingLoading =
    document.getElementById(
      "pending-loading"
    );

  const pendingEmpty =
    document.getElementById(
      "pending-empty"
    );

  const pendingPasswordInput =
    document.getElementById(
      "pendingPassword"
    );


  if(!pendingList){

    return;

  }


  pendingList.innerHTML = "";

  pendingLoading.style.display =
    "block";

  pendingEmpty.style.display =
    "none";


  /* =====================================================
     🔐 SAME ADMIN PASSWORD
     ===================================================== */

  const password =
    pendingPasswordInput
      ? pendingPasswordInput.value
      : "";


  if(!password){

    pendingLoading.style.display =
      "none";

    pendingEmpty.innerHTML =
      "🔐 Pending photos पाहण्यासाठी Admin Password टाका.";

    pendingEmpty.style.display =
      "block";

    return;

  }


  try{

    const res =
      await fetch(
        `${SERVER}/pending-photos`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({
            password:password
          })
        }
      );


    if(res.status === 401){

      pendingLoading.style.display =
        "none";

      pendingEmpty.innerHTML =
        "❌ Admin Password चुकीचा आहे.";

      pendingEmpty.style.display =
        "block";

      return;

    }


    if(!res.ok){

      throw new Error(
        "Pending photos request failed"
      );

    }


    const data =
      await res.json();


    pendingLoading.style.display =
      "none";


    if(
      !data.success ||
      !Array.isArray(data.photos) ||
      data.photos.length === 0
    ){

      pendingEmpty.innerHTML =
        "📭 सध्या कोणतेही Pending फोटो नाहीत.";

      pendingEmpty.style.display =
        "block";

      return;

    }


    pendingEmpty.style.display =
      "none";


    data.photos.forEach(photo => {

      createPendingCard(
        photo,
        password
      );

    });

  }catch(err){

    pendingLoading.style.display =
      "none";

    pendingEmpty.innerHTML =
      "❌ Pending photos load झाले नाहीत.";

    pendingEmpty.style.display =
      "block";

    console.error(
      "Pending error:",
      err
    );

  }

}


/* =====================================================
   🖼️ CREATE PENDING PHOTO CARD
   ===================================================== */

function createPendingCard(
  photo,
  password
){

  const pendingList =
    document.getElementById(
      "pending-list"
    );


  const card =
    document.createElement("div");

  card.className =
    "pending-card";


  /* =====================================================
     IMAGE
     ===================================================== */

  const image =
    document.createElement("img");

  image.src =
    photo.secure_url ||
    photo.url;

  image.alt =
    "Pending Photo";


  /* =====================================================
     NAME + CAPTION
     ===================================================== */

  const context =
    photo.context || {};

  const name =
    context.name || "";

  const caption =
    context.caption || "";


  const info =
    document.createElement("div");

  info.className =
    "pending-info";


  if(name){

    const nameText =
      document.createElement("p");

    nameText.innerHTML =
      "<strong>👤 नाव:</strong> " +
      escapeHtml(name);

    info.appendChild(
      nameText
    );

  }


  if(caption){

    const captionText =
      document.createElement("p");

    captionText.innerHTML =
      "<strong>📝 Caption:</strong> " +
      escapeHtml(caption);

    info.appendChild(
      captionText
    );

  }


  /* =====================================================
     📅 APPROVE MONTH
     ===================================================== */

  const approveDateBox =
    document.createElement("div");

  approveDateBox.className =
    "approve-date-box";


  const monthLabel =
    document.createElement("label");

  monthLabel.innerText =
    "📅 Approve Month";


  const monthSelect =
    document.createElement("select");

  monthSelect.className =
    "approve-month";


  months.forEach(month => {

    const option =
      document.createElement("option");

    option.value =
      month;

    option.textContent =
      month;

    monthSelect.appendChild(
      option
    );

  });


  const currentMonth =
    context.month ||
    months[now.getMonth()];


  monthSelect.value =
    months.includes(currentMonth)
      ? currentMonth
      : months[now.getMonth()];


  /* =====================================================
     📅 APPROVE YEAR
     ===================================================== */

  const yearLabel =
    document.createElement("label");

  yearLabel.innerText =
    "📅 Approve Year";


  const yearInput =
    document.createElement("input");

  yearInput.type =
    "number";

  yearInput.className =
    "approve-year";

  yearInput.value =
    context.year ||
    now.getFullYear();

  yearInput.min =
    "2000";

  yearInput.max =
    "2100";

  yearInput.placeholder =
    "Year";


  approveDateBox.appendChild(
    monthLabel
  );

  approveDateBox.appendChild(
    monthSelect
  );

  approveDateBox.appendChild(
    yearLabel
  );

  approveDateBox.appendChild(
    yearInput
  );


  /* =====================================================
     BUTTONS
     ===================================================== */

  const actions =
    document.createElement("div");

  actions.className =
    "pending-actions";


  const approveBtn =
    document.createElement("button");

  approveBtn.className =
    "approve-btn";

  approveBtn.innerText =
    "✅ Approve";


  const rejectBtn =
    document.createElement("button");

  rejectBtn.className =
    "reject-btn";

  rejectBtn.innerText =
    "❌ Reject";


  approveBtn.onclick =
    async function(){

      await approvePhoto(
        photo.public_id,
        password,
        card,
        monthSelect.value,
        yearInput.value
      );

    };


  rejectBtn.onclick =
    async function(){

      await rejectPhoto(
        photo.public_id,
        password,
        card
      );

    };


  actions.appendChild(
    approveBtn
  );

  actions.appendChild(
    rejectBtn
  );


  card.appendChild(
    image
  );

  card.appendChild(
    info
  );

  card.appendChild(
    approveDateBox
  );

  card.appendChild(
    actions
  );


  pendingList.appendChild(
    card
  );

}


/* =====================================================
   🛡️ HTML ESCAPE
   ===================================================== */

function escapeHtml(text){

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


/* =====================================================
   ✅ APPROVE PHOTO
   Month + Year Server ला पाठवतो
   ===================================================== */

async function approvePhoto(
  public_id,
  password,
  card,
  month,
  year
){

  if(!month){

    alert(
      "❌ Approve Month निवडा."
    );

    return;

  }


  if(!year){

    alert(
      "❌ Approve Year टाका."
    );

    return;

  }


  if(
    !confirm(
      `हा फोटो ${month} ${year} मध्ये Gallery मध्ये दाखवायचा आहे का? ✅`
    )
  ){

    return;

  }


  const buttons =
    card.querySelectorAll(
      "button"
    );


  buttons.forEach(
    btn =>
      btn.disabled = true
  );


  overlay.style.display =
    "flex";

  progressBar.value =
    0;

  progressText.innerText =
    "✅ Photo approving...";


  try{

    const res =
      await fetch(
        `${SERVER}/approve-photo`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            public_id:
              public_id,

            password:
              password,

            month:
              month,

            year:
              year

          })

        }
      );


    const data =
      await res.json();


    overlay.style.display =
      "none";


    if(data.success){

      alert(
        `✅ Photo approved!\n📅 ${month} ${year}`
      );


      card.remove();

      checkPendingEmpty();

      loadPhotos();

    }else{

      alert(
        data.message ||
        "❌ Photo approve झाला नाही."
      );


      buttons.forEach(
        btn =>
          btn.disabled = false
      );

    }

  }catch(err){

    overlay.style.display =
      "none";


    console.error(
      "Approve error:",
      err
    );


    alert(
      "❌ Network error"
    );


    buttons.forEach(
      btn =>
        btn.disabled = false
    );

  }

}


/* =====================================================
   ❌ REJECT PHOTO
   ===================================================== */

async function rejectPhoto(
  public_id,
  password,
  card
){

  if(
    !confirm(
      "हा फोटो Reject करून Delete करायचा आहे का? ❌"
    )
  ){

    return;

  }


  const buttons =
    card.querySelectorAll(
      "button"
    );


  buttons.forEach(
    btn =>
      btn.disabled = true
  );


  overlay.style.display =
    "flex";

  progressBar.value =
    0;

  progressText.innerText =
    "❌ Photo rejecting...";


  try{

    const res =
      await fetch(
        `${SERVER}/reject-photo`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            public_id:
              public_id,

            password:
              password

          })

        }
      );


    const data =
      await res.json();


    overlay.style.display =
      "none";


    if(data.success){

      alert(
        "❌ Photo rejected and deleted."
      );


      card.remove();

      checkPendingEmpty();

    }else{

      alert(
        data.message ||
        "❌ Photo reject झाला नाही."
      );


      buttons.forEach(
        btn =>
          btn.disabled = false
      );

    }

  }catch(err){

    overlay.style.display =
      "none";


    console.error(
      "Reject error:",
      err
    );


    alert(
      "❌ Network error"
    );


    buttons.forEach(
      btn =>
        btn.disabled = false
    );

  }

}


/* =====================================================
   📭 CHECK PENDING EMPTY
   ===================================================== */

function checkPendingEmpty(){

  const pendingList =
    document.getElementById(
      "pending-list"
    );

  const pendingEmpty =
    document.getElementById(
      "pending-empty"
    );


  if(
    pendingList &&
    pendingList.children.length === 0
  ){

    pendingEmpty.innerHTML =
      "📭 सध्या कोणतेही Pending फोटो नाहीत.";

    pendingEmpty.style.display =
      "block";

  }

}


/* =====================================================
   🗑️ DELETE PHOTO
   ===================================================== */

async function deletePhoto(
  public_id
){

  if(
    !confirm(
      "Do you want to delete this photo?"
    )
  ){

    return;

  }


  const password =
    prompt(
      "Enter admin password 🔐"
    );


  if(!password){

    alert(
      "Password not entered ❌"
    );

    return;

  }


  overlay.style.display =
    "flex";

  progressBar.value =
    0;

  progressText.innerText =
    "🗑 Deleting photo...";


  try{

    const res =
      await fetch(
        `${SERVER}/delete-photo`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            public_id:
              public_id,

            password:
              password

          })

        }
      );


    const data =
      await res.json();


    overlay.style.display =
      "none";


    if(data.success){

      alert(
        "✅ Photo deleted successfully"
      );

      loadPhotos();

    }else{

      alert(
        data.message ||
        "❌ Wrong Password"
      );

    }

  }catch(err){

    overlay.style.display =
      "none";

    console.error(err);

    alert(
      "❌ Network error"
    );

  }

}


/* =====================================================
   🔐 PENDING PHOTOS PASSWORD BUTTON
   ===================================================== */

const pendingPasswordInput =
  document.getElementById(
    "pendingPassword"
  );

const pendingLoadBtn =
  document.getElementById(
    "pendingLoadBtn"
  );


if(pendingLoadBtn){

  pendingLoadBtn.addEventListener(
    "click",
    function(){

      loadPendingPhotos();

    }
  );

}


/* =====================================================
   🔐 ENTER KEY SUPPORT
   ===================================================== */

if(pendingPasswordInput){

  pendingPasswordInput.addEventListener(
    "keydown",
    function(e){

      if(e.key === "Enter"){

        e.preventDefault();

        loadPendingPhotos();

      }

    }
  );

}


/* =====================================================
   🚀 INIT
   ===================================================== */

loadPhotos();

});