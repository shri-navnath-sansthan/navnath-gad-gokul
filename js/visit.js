fetch('https://api.countapi.xyz/hit/navnathgad_official_site/visits')
.then(response => response.json())
.then(data => {
document.getElementById("visitor-count").innerText = data.value;
});