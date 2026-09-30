const header = document.querySelector(".site-header");

window.addEventListener(
  "scroll",
  () => {
    const isScrolled = window.scrollY > 16;
    header.classList.toggle("is-scrolled", isScrolled);
  },
  { passive: true }
);

document.querySelectorAll("[data-reference-slider]").forEach((slider) => {
  const track = slider.querySelector(".reference-slider-track");
  const slides = [...slider.querySelectorAll(".reference-slide")];
  const previousButton = slider.querySelector("[data-slide-prev]");
  const nextButton = slider.querySelector("[data-slide-next]");
  const currentLabel = slider.querySelector("[data-slide-current]");
  let currentIndex = 0;

  const updateSlider = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    currentLabel.textContent = String(currentIndex + 1);
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;

    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", String(index !== currentIndex));
      const image = slide.querySelector("img");
      if (image) image.tabIndex = index === currentIndex ? 0 : -1;
    });
  };

  previousButton.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateSlider();
  });

  nextButton.addEventListener("click", () => {
    currentIndex = Math.min(slides.length - 1, currentIndex + 1);
    updateSlider();
  });

  updateSlider();
});

const lightbox = document.querySelector("[data-image-lightbox]");
const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
const lightboxClose = lightbox.querySelector("[data-lightbox-close]");
const lightboxPrevious = lightbox.querySelector("[data-lightbox-prev]");
const lightboxNext = lightbox.querySelector("[data-lightbox-next]");
const lightboxCounter = lightbox.querySelector("[data-lightbox-counter]");
const lightboxCurrent = lightbox.querySelector("[data-lightbox-current]");
const lightboxTotal = lightbox.querySelector("[data-lightbox-total]");
let lightboxTrigger = null;
let lightboxImages = [];
let lightboxIndex = 0;

const renderLightbox = () => {
  const image = lightboxImages[lightboxIndex];
  if (!image) return;

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent =
    image.closest("figure")?.querySelector("figcaption")?.textContent.trim() || image.alt;

  const hasMultipleImages = lightboxImages.length > 1;
  lightboxPrevious.hidden = !hasMultipleImages;
  lightboxNext.hidden = !hasMultipleImages;
  lightboxCounter.hidden = !hasMultipleImages;
  lightboxCurrent.textContent = String(lightboxIndex + 1);
  lightboxTotal.textContent = String(lightboxImages.length);
};

const openLightbox = (image) => {
  const slider = image.closest("[data-reference-slider]");

  lightboxTrigger = image;
  lightboxImages = slider ? [...slider.querySelectorAll(".reference-slide img")] : [image];
  lightboxIndex = Math.max(0, lightboxImages.indexOf(image));
  renderLightbox();
  document.body.classList.add("lightbox-open");
  lightbox.showModal();
};

const stepLightbox = (step) => {
  if (lightboxImages.length < 2) return;
  lightboxIndex = (lightboxIndex + step + lightboxImages.length) % lightboxImages.length;
  renderLightbox();
};

document.querySelectorAll("main img").forEach((image) => {
  image.dataset.lightboxReady = "";
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `${image.alt} 크게 보기`);

  if (!image.closest("[aria-hidden='true']")) image.tabIndex = 0;

  image.addEventListener("click", () => openLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

lightboxClose.addEventListener("click", () => lightbox.close());
lightboxPrevious.addEventListener("click", () => stepLightbox(-1));
lightboxNext.addEventListener("click", () => stepLightbox(1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") stepLightbox(-1);
  if (event.key === "ArrowRight") stepLightbox(1);
});
lightbox.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImages = [];
  lightboxIndex = 0;
  lightboxTrigger?.focus();
});
