// Select all sections and nav links
const sections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 95; // adjust for header height
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll('.fade-in-section');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add visible class when section is in the viewport
        entry.target.classList.add('visible');
      } else {
        // Remove visible class when section leaves the viewport
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.1,  // Trigger when 10% of the section is visible
  });

  sections.forEach(section => {
    observer.observe(section);
  });
});

let currentIndex = 0;
const images = document.querySelectorAll('.carousel img');
const totalImages = images.length;

function showImage(index) {
  // Hide all images
  images.forEach((img, i) => {
    img.classList.remove('active');
    img.style.display = 'none'; // Hide all images
  });

  // Show the current image
  images[index].style.display = 'block'; // Show the current image
  images[index].classList.add('active');
}

// Function to change the image every 5 seconds
function startCarousel() {
  showImage(currentIndex);
  currentIndex = (currentIndex + 1) % totalImages; // Loop back to the first image
  setTimeout(startCarousel, 5000); // Change image every 5 seconds
}

// Start the carousel
startCarousel();

const userContainers = document.querySelectorAll('.usercon');

userContainers.forEach(container => {
  container.addEventListener('mouseenter', () => {
    userContainers.forEach(c => {
      if (c === container) {
        c.classList.add('highlight');
        c.classList.remove('blur');
      } else {
        c.classList.add('blur');
        c.classList.remove('highlight');
      }
    });
  });

  container.addEventListener('mouseleave', () => {
    userContainers.forEach(c => {
      c.classList.remove('highlight');
      c.classList.remove('blur');
    });
  });
});