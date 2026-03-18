/* ══════════════════════════════════════════════════════════════
   POPUP PALETA — Isabella & Samuel
   ══════════════════════════════════════════════════════════════ */

(function () {

  function openPopup() {
    const overlay = document.getElementById('popup-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePopup(e) {
    const overlay = document.getElementById('popup-overlay');
    if (!overlay) return;
    // Fecha ao clicar no overlay, no botão ✕ ou via ESC
    if (e && e.target !== overlay && !e.target.classList.contains('popup-close')) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Expõe globalmente para uso inline no HTML
  window.openPopup  = openPopup;
  window.closePopup = closePopup;

  // Fecha com ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('popup-overlay');
      if (overlay && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

})();
