/* ══════════════════════════════════════════════════════════════
   COUNTDOWN — Isabella & Samuel 07.11.2026
   ══════════════════════════════════════════════════════════════ */

(function () {
  const WEDDING = new Date('2026-11-07T16:30:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const diff = WEDDING - now;
    if (diff <= 0) return;

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = pad(val);
    };

    set('cd-days',    days);
    set('cd-hours',   hours);
    set('cd-minutes', minutes);
    set('cd-seconds', seconds);
  }

  document.addEventListener('DOMContentLoaded', () => {
    tick();
    setInterval(tick, 1000);
  });
})();
