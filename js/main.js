// ============================================
//   Gabriel Abdo Alcântara — Portfolio
//   Navigation & Interactions
// ============================================

const pages = {
  home:      document.getElementById('page-home'),
  portfolio: document.getElementById('page-portfolio'),
  bts:       document.getElementById('page-bts'),
  about:     document.getElementById('page-about'),
};

const navLinks = document.querySelectorAll('[data-page]');

function showPage(pageKey) {
  Object.values(pages).forEach(p => p.classList.remove('active'));
  const target = pages[pageKey];
  if (target) target.classList.add('active');
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageKey);
  });
  history.pushState(null, '', pageKey === 'home' ? '/' : '#' + pageKey);
  window.scrollTo(0, 0);
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

function loadFromHash() {
  const hash = window.location.hash.replace('#', '');
  const validPages = Object.keys(pages);
  if (hash && validPages.includes(hash)) {
    showPage(hash);
  } else {
    showPage('home');
  }
}

window.addEventListener('popstate', loadFromHash);
loadFromHash();

// ============================================
//   Lightbox
// ============================================

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.photo-grid img, .bts-grid img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('open');
  });
});

document.getElementById('lightbox-close').addEventListener('click', () => {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
  }
});
