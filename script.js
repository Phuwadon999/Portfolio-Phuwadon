const year = document.getElementById('year');
const revealElements = document.querySelectorAll('.reveal');
const projectCards = document.querySelectorAll('[data-href]');
const zoomables = document.querySelectorAll('.zoomable');
const galleries = document.querySelectorAll('[data-gallery]');
const useModalZoom = true;

if (year) {
  year.textContent = new Date().getFullYear();
}

window.requestAnimationFrame(() => {
  document.body.classList.add('is-ready');
});

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

revealElements.forEach((element) => observer.observe(element));

projectCards.forEach((card) => {
  const navigateToProject = () => {
    const target = card.getAttribute('data-href');
    if (target) {
      window.location.href = target;
    }
  };

  card.addEventListener('click', (event) => {
    const interactiveElement = event.target.closest('a, button');
    if (interactiveElement && interactiveElement !== card) {
      return;
    }
    navigateToProject();
  });

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToProject();
    }
  });
});

galleries.forEach((gallery) => {
  const figures = [...gallery.querySelectorAll('.figure')];
  const counter = gallery.querySelector('[data-gallery-counter]');
  const previousButton = gallery.querySelector('[data-gallery-prev]');
  const nextButton = gallery.querySelector('[data-gallery-next]');
  let activeIndex = 0;

  const showImage = (index) => {
    activeIndex = (index + figures.length) % figures.length;
    figures.forEach((figure, figureIndex) => {
      figure.classList.toggle('is-active', figureIndex === activeIndex);
    });
    counter.textContent = `${activeIndex + 1} / ${figures.length}`;
  };

  previousButton.addEventListener('click', () => showImage(activeIndex - 1));
  nextButton.addEventListener('click', () => showImage(activeIndex + 1));
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
    if (event.key === 'ArrowRight') showImage(activeIndex + 1);
  });

  let touchStartX = 0;
  gallery.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  gallery.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(distance) > 45) showImage(activeIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  gallery.tabIndex = 0;
  showImage(0);
});

const openImageModal = (imageElement) => {
  const existingModal = document.querySelector('.image-modal');
  if (!existingModal) {
    const imageModal = document.createElement('div');
    imageModal.className = 'image-modal';
    imageModal.innerHTML = `
      <div class="image-modal__panel" role="dialog" aria-modal="true" aria-label="ภาพขยาย">
        <div class="image-modal__frame">
          <img alt="" />
        </div>
        <div class="image-modal__caption">
          <span></span>
          <button class="image-modal__close" type="button">ปิด</button>
        </div>
      </div>
    `;
    document.body.appendChild(imageModal);
    imageModal.addEventListener('click', (event) => {
      if (event.target === imageModal) {
        imageModal.classList.remove('is-open');
        imageModal.querySelector('img').removeAttribute('src');
        imageModal.querySelector('img').alt = '';
        document.body.classList.remove('modal-open');
      }
    });
    imageModal.querySelector('button').addEventListener('click', () => {
      imageModal.classList.remove('is-open');
      imageModal.querySelector('img').removeAttribute('src');
      imageModal.querySelector('img').alt = '';
      document.body.classList.remove('modal-open');
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && imageModal.classList.contains('is-open')) {
        imageModal.classList.remove('is-open');
        imageModal.querySelector('img').removeAttribute('src');
        imageModal.querySelector('img').alt = '';
        document.body.classList.remove('modal-open');
      }
    });
  }

  const imageModal = document.querySelector('.image-modal');
  const modalImage = imageModal.querySelector('img');
  const modalCaption = imageModal.querySelector('span');
  const fullSource = imageElement.getAttribute('data-fullsrc') || imageElement.currentSrc || imageElement.src;
  const caption = imageElement.getAttribute('data-caption') || imageElement.alt || '';

  modalImage.src = fullSource;
  modalImage.alt = imageElement.alt || caption;
  modalCaption.textContent = caption;
  imageModal.classList.add('is-open');
  document.body.classList.add('modal-open');
  imageModal.querySelector('button').focus();
};

zoomables.forEach((image) => {
  image.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openImageModal(image);
  });

  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openImageModal(image);
    }
  });
});
