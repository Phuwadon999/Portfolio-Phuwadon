const year = document.getElementById('year');
const revealElements = document.querySelectorAll('.reveal');
const projectCards = document.querySelectorAll('[data-href]');
const zoomables = document.querySelectorAll('.zoomable');
const useModalZoom = /(^|\/)project-[^/]+\.html$/i.test(window.location.pathname);

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

const openImageViewer = (imageElement) => {
  const fullSource = imageElement.getAttribute('data-fullsrc') || imageElement.currentSrc || imageElement.src;
  const caption = imageElement.getAttribute('data-caption') || imageElement.alt || '';

  const viewerUrl = new URL('image-viewer.html', window.location.href);
  viewerUrl.searchParams.set('src', fullSource);
  viewerUrl.searchParams.set('caption', caption);

  window.location.assign(viewerUrl.toString());
};

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
    if (useModalZoom) {
      openImageModal(image);
    } else {
      openImageViewer(image);
    }
  });

  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (useModalZoom) {
        openImageModal(image);
      } else {
        openImageViewer(image);
      }
    }
  });
});
