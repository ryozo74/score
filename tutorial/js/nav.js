// Score Tutorial — nav.js

// Lightbox
function openLightbox(wrap) {
  const img = wrap.querySelector('img');
  if (!img) return;
  const overlay = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  if (!overlay || !lbImg) return;
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  showHint();
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});

// Prevent lightbox close when clicking image itself
document.addEventListener('DOMContentLoaded', function() {
  const lbImg = document.getElementById('lightbox-img');
  if (lbImg) {
    lbImg.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
});

// Keyboard hint
function showHint() {
  let hint = document.querySelector('.keyboard-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.textContent = 'Esc で閉じる';
    document.body.appendChild(hint);
  }
  hint.classList.add('show');
  setTimeout(() => hint.classList.remove('show'), 2000);
}

// Smooth scroll to stage on hash navigation
if (window.location.hash) {
  setTimeout(function() {
    const el = document.querySelector(window.location.hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}
