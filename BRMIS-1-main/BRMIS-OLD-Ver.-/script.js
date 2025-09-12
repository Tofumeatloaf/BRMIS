document.getElementById("year").textContent = new Date().getFullYear();

function roleSelected(role) {
    alert("You selected " + role);
}

function toggleMenu() {
    const nav = document.getElementById("navbarNav");
    nav.style.display = nav.style.display === "flex" ? "none" : "flex";
}

let images = ["nch.webp", "bg1.jpg", "bg.jpg"];
let currentIndex = 0;
function changeImage() {
    currentIndex = (currentIndex + 1) % images.length;
    document.getElementById("carouselImage").src = images[currentIndex];
}
setInterval(changeImage, 3000);