const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const slides = Array.from(document.querySelectorAll(".testimonial-card"));
const dotsContainer = document.querySelector(".slider-dots");
const arrowButtons = Array.from(document.querySelectorAll(".slider-arrow"));
let currentSlide = 0;
let autoRotate;

function renderSlide(index) {
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === index);
  });

  if (dotsContainer) {
    dotsContainer.querySelectorAll("button").forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  }
}

function goToSlide(nextIndex) {
  currentSlide = (nextIndex + slides.length) % slides.length;
  renderSlide(currentSlide);
}

function startAutoRotate() {
  stopAutoRotate();
  autoRotate = window.setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 5500);
}

function stopAutoRotate() {
  if (autoRotate) {
    window.clearInterval(autoRotate);
  }
}

if (slides.length && dotsContainer) {
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir para o depoimento ${index + 1}`);
    dot.addEventListener("click", () => {
      goToSlide(index);
      startAutoRotate();
    });
    dotsContainer.appendChild(dot);
  });

  arrowButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.direction === "next" ? 1 : -1;
      goToSlide(currentSlide + direction);
      startAutoRotate();
    });
  });

  renderSlide(currentSlide);
  startAutoRotate();
}

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) {
      return;
    }

    document.querySelectorAll(".faq-list details[open]").forEach((openDetail) => {
      if (openDetail !== detail) {
        openDetail.open = false;
      }
    });
  });
});
