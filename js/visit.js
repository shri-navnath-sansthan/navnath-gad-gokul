fetch("https://api.countapi.xyz/hit/navnathgad_counter/visits")
.then(function(response){
return response.json();
})
.then(function(data){
document.getElementById("visitor-count").innerText = data.value;
});