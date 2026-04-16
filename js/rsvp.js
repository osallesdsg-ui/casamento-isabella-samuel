/* ══════════════════════════════════════════════════════════════
   RSVP — Isabella & Samuel
   Lógica de confirmação de presença
   ══════════════════════════════════════════════════════════════ */

(function () {
  /* ── CONFIG ── */
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwI58CRYaviqvXmn8M-ZZCOAEJqlZbUsBSdnSMivl9XARR9rJaYVV3sE4g-h8XrQ8vF/exec';
  const DEADLINE   = new Date('2026-03-20T23:59:59');

  /* ── STATE ── */
  let grupoId     = null;
  let grupo       = null;
  let confirmacoes = {};
  let isPreview   = false;

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const params = new URLSearchParams(location.search);
    grupoId = params.get('g');

    if (!grupoId || !window.GRUPOS || !window.GRUPOS[grupoId]) {
      // Preview mode
      grupoId   = 'amigos_johnnie_yasmin';
      isPreview = true;
    }

    grupo = window.GRUPOS[grupoId];
    if (!grupo) return;

    renderGreeting();
    showRSVPSection();
    loadFromSheets();
  }

  /* ── GREETING ── */
  function renderGreeting() {
    const el = document.getElementById('rsvp-greeting');
    if (!el) return;
    const nomes = grupo.membros;
    let txt;
    if (nomes.length === 1)      txt = `Olá, ${firstName(nomes[0])}! 🌿`;
    else if (nomes.length === 2) txt = `Olá, ${firstName(nomes[0])} e ${firstName(nomes[1])}! Que alegria ter vocês aqui! 🌿`;
    else                         txt = `Olá, ${nomes.map(firstName).join(', ')}! Que alegria ter vocês aqui! 🌿`;
    el.textContent = txt;

    if (isPreview) {
      const badge = document.getElementById('preview-badge');
      if (badge) badge.style.display = 'flex';
    }
  }

  function firstName(fullName) {
    return fullName.split(' ')[0];
  }

  /* ── SHOW RSVP SECTION ── */
  function showRSVPSection() {
    const sec = document.getElementById('rsvp-section');
    if (sec) sec.style.display = 'block';

    if (isPastDeadline()) {
      showClosed();
      return;
    }
    renderMembers({});
  }

  /* ── RENDER MEMBERS ── */
  function renderMembers(saved) {
    const list = document.getElementById('members-list');
    if (!list) return;
    list.innerHTML = '';

    grupo.membros.forEach((nome, i) => {
      const status = saved[nome] || null;
      const card = document.createElement('div');
      card.className = 'member-card fade-up';
      card.style.animationDelay = `${i * 0.08}s`;
      card.innerHTML = `
        <div class="member-name">${nome}</div>
        <div class="member-btns">
          <button class="status-btn ${status === 'yes' ? 'active-yes' : ''}"
                  onclick="RSVP.set('${nome}','yes',this)">✓ Vai</button>
          <button class="status-btn ${status === 'no' ? 'active-no' : ''}"
                  onclick="RSVP.set('${nome}','no',this)">✕ Não vai</button>
          <button class="status-btn ${status === 'pending' ? 'active-pending' : ''}"
                  onclick="RSVP.set('${nome}','pending',this)">⏳ Pendente</button>
        </div>`;
      list.appendChild(card);
    });

    // Intersection observer para fade-up
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    list.querySelectorAll('.member-card').forEach(el => observer.observe(el));
  }

  /* ── SET STATUS ── */
  window.RSVP = {
    set(nome, status, btn) {
      confirmacoes[nome] = status;
      // Visual update
      const btns = btn.parentElement.querySelectorAll('.status-btn');
      btns.forEach(b => b.classList.remove('active-yes','active-no','active-pending'));
      btn.classList.add(status === 'yes' ? 'active-yes' : status === 'no' ? 'active-no' : 'active-pending');
      ripple(btn);
      saveLocal();
    },
    submit() { submitRSVP(false); },
    submitEdit() { submitRSVP(true); },
    enterEdit() { enterEditMode(); }
  };

  /* ── RIPPLE ── */
  function ripple(btn) {
    const el = document.createElement('span');
    el.className = 'ripple-el';
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    el.style.cssText = `width:${size}px;height:${size}px;left:${r.width/2 - size/2}px;top:${r.height/2 - size/2}px`;
    btn.style.position = 'relative';
    btn.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  /* ── LOCAL STORAGE ── */
  function saveLocal() {
    localStorage.setItem('rsvp_' + grupoId, JSON.stringify(confirmacoes));
  }
  function loadLocal() {
    try { return JSON.parse(localStorage.getItem('rsvp_' + grupoId) || '{}'); }
    catch { return {}; }
  }

  /* ── LOAD FROM SHEETS ── */
  function loadFromSheets() {
    const saved = loadLocal();
    const callbackName = '__rsvpCb_' + Date.now();
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      script.remove();
      delete window[callbackName];
      renderMembers(saved);
    }, 5000);

    window[callbackName] = function(data) {
      clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
      hideLoading();

      if (data && data.confirmacoes && data.confirmacoes.length) {
        data.confirmacoes.forEach(({ nome, status }) => {
          saved[nome] = status === 'Confirmado' ? 'yes' : status === 'Não vai' ? 'no' : 'pending';
        });
        Object.assign(confirmacoes, saved);
        saveLocal();
        renderMembers(saved);

        const allAnswered = grupo.membros.every(m => saved[m]);
        if (allAnswered) {
          localStorage.setItem('rsvp_confirmed_' + grupoId, 'true');
          document.getElementById('submit-area').style.display = 'none';
          showSuccess();
        } else {
          renderMembers(saved);
        }
      } else {
        renderMembers(saved);
      }
    };

    showLoading();
    script.src = `${SCRIPT_URL}?g=${encodeURIComponent(grupoId)}&callback=${callbackName}`;
    script.onerror = () => {
      clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
      hideLoading();
      renderMembers(saved);
    };
    document.head.appendChild(script);
  }

  function showLoading() {
    const el = document.getElementById('rsvp-loading');
    if (el) el.style.display = 'flex';
  }
  function hideLoading() {
    const el = document.getElementById('rsvp-loading');
    if (el) el.style.display = 'none';
  }

  /* ── SUBMIT ── */
  async function submitRSVP(isEdit) {
    if (!Object.keys(confirmacoes).length) return;

    const btn = document.getElementById(isEdit ? 'submit-edit-btn' : 'submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

    const payload = {
      grupoId,
      timestamp: new Date().toISOString(),
      isEdit,
      confirmacoes: grupo.membros.map(nome => ({
        nome,
        status: confirmacoes[nome] === 'yes' ? 'Confirmado'
               : confirmacoes[nome] === 'no'  ? 'Não vai' : 'Pendente'
      }))
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode:   'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify(payload)
      });
    } catch (e) { /* no-cors sempre rejeita */ }

    localStorage.setItem('rsvp_confirmed_' + grupoId, 'true');
    saveLocal();
    document.getElementById('submit-area').style.display = 'none';
    showSuccess();
  }

  /* ── SUCCESS BANNER ── */
  function showSuccess() {
     
     const temConfirmado = grupo.membros.some(n => confirmacoes[n] === 'yes');
     const atalhos = document.getElementById('post-confirm-links');
     if (atalhos) atalhos.style.display = temConfirmado ? 'block' : 'none';
      
    const banner = document.getElementById('success-banner');
    if (!banner) return;

    const confirmados = grupo.membros.filter(n => confirmacoes[n] === 'yes').map(firstName);
    const naoVao      = grupo.membros.filter(n => confirmacoes[n] === 'no').map(firstName);
    const pendentes   = grupo.membros.filter(n => confirmacoes[n] === 'pending').map(firstName);

    let msg = '';
    if (confirmados.length && !naoVao.length && !pendentes.length) {
      msg = `Que alegria ter ${listNames(confirmados)} com a gente neste dia tão especial! 🌿<br><br>Até 07 de novembro! 💛`;
    } else if (!confirmados.length && naoVao.length && !pendentes.length) {
      msg = `Sentiremos sua falta… 🤍<br><br>Você pode editar até 20 de março a sua presença.`;
    } else {
      let parts = [];
      if (confirmados.length) parts.push(`Que alegria ter ${listNames(confirmados)} com a gente! 🌿`);
      if (naoVao.length)      parts.push(`Sentiremos a falta de ${listNames(naoVao)}… mas você pode editar até 20 de março a sua presença. 💛`);
      msg = parts.join('<br>');
    }

    if (pendentes.length === 1)
      msg += `<br><br><span style="color:var(--gold)">${pendentes[0]}</span> ficou como pendente — não esqueça de voltar e confirmar!`;
    else if (pendentes.length > 1)
      msg += `<br><br><span style="color:var(--gold)">${pendentes.join(', ')}</span> ficaram como pendente — não esqueça de voltar e confirmar!`;

    const msgEl = document.getElementById('success-msg');
    if (msgEl) msgEl.innerHTML = msg;

    banner.classList.add('visible');
    updateEditTimer();

    const deadlineEl = document.getElementById('edit-deadline');
    if (deadlineEl) deadlineEl.textContent = '20 de março de 2026';
  }

  function listNames(arr) {
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} e ${arr[1]}`;
    return arr.slice(0,-1).join(', ') + ' e ' + arr[arr.length-1];
  }

  /* ── EDIT MODE ── */
  function enterEditMode() {
    const banner = document.getElementById('success-banner');
    if (banner) banner.classList.remove('visible');
    const area = document.getElementById('submit-area');
    if (area) { area.style.display = 'block'; }
    const btn = document.getElementById('submit-btn');
    if (btn) { btn.textContent = 'Confirmar alterações'; btn.disabled = false; }
    const list = document.getElementById('members-list');
    if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── EDIT TIMER ── */
  function updateEditTimer() {
    const el = document.getElementById('edit-time-left');
    if (!el) return;
    const diff = DEADLINE - new Date();
    if (diff <= 0) {
      el.textContent = 'Prazo encerrado';
      const editBtn = document.getElementById('edit-btn');
      if (editBtn) { editBtn.disabled = true; editBtn.style.opacity = '0.4'; }
      return;
    }
    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (days > 0)        el.textContent = `${days} dias e ${hours}h restantes`;
    else if (hours > 0)  el.textContent = `${hours}h e ${minutes}min restantes`;
    else                 el.textContent = `${minutes} minutos restantes`;
  }
  setInterval(updateEditTimer, 60000);

  /* ── DEADLINE ── */
  function isPastDeadline() { return new Date() > DEADLINE; }

  function showClosed() {
    const closed = document.getElementById('rsvp-closed');
    const area   = document.getElementById('submit-area');
    if (closed) closed.style.display = 'block';
    if (area)   area.style.display   = 'none';
  }

})();
