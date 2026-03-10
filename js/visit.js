fetch("https://api.countapi.xyz/hit/navnathgad_official_site/visits")
.then(function(response){
    return response.json();
})
.then(function(data){
    document.getElementById("visitor-count").innerText = data.value;
})
.catch(function(error){
    console.log("Visitor counter error:", error);
    document.getElementById("visitor-count").innerText = "0";
});