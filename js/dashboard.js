/* ══════════════════════════════════════════════════════════════
   DASHBOARD — Isabella & Samuel
   Leitura de confirmações via CSV público do Google Sheets
   ══════════════════════════════════════════════════════════════ */

(function () {
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTHH5AkxiI7BgeUmE5Ffak93MlxE1AAQ5vFUSihYzSUjof-FOswtLxtgG2caRTIh2vF2PajarI_stG/pub?gid=822960724&single=true&output=csv';
  const REFRESH_MS = 120000; // 2 min

  let allRows = [];
  let filterStatus = 'all';
  let searchTerm   = '';

  document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, REFRESH_MS);

    document.getElementById('search-input')?.addEventListener('input', e => {
      searchTerm = e.target.value.toLowerCase();
      renderTable();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterStatus = btn.dataset.status;
        renderTable();
      });
    });
  });

  /* ── LOAD ── */
  async function loadData() {
    try {
      showSpinner(true);
      const res  = await fetch(CSV_URL + '&t=' + Date.now());
      const text = await res.text();
      allRows = parseCSV(text);
      renderStats();
      renderTable();
    } catch (e) {
      showError('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      showSpinner(false);
      document.getElementById('last-updated').textContent =
        'Atualizado: ' + new Date().toLocaleTimeString('pt-BR');
    }
  }

  /* ── CSV PARSER ── */
  function parseCSV(text) {
    const lines = text.trim().split('\n').slice(1); // skip header
    return lines.map(line => {
      const cols = line.split(',');
      return {
        grupoId:    (cols[0] || '').replace(/"/g,'').trim(),
        nome:       (cols[1] || '').replace(/"/g,'').trim(),
        status:     (cols[2] || '').replace(/"/g,'').trim(),
        primeiraConf:(cols[3] || '').replace(/"/g,'').trim(),
        ultimaAtt:  (cols[4] || '').replace(/"/g,'').trim(),
        editado:    (cols[5] || '').replace(/"/g,'').trim()
      };
    }).filter(r => r.nome);
  }

  /* ── STATS ── */
  function renderStats() {
    const total      = allRows.length;
    const confirmados = allRows.filter(r => r.status === 'Confirmado').length;
    const naoVao     = allRows.filter(r => r.status === 'Não vai').length;
    const pendentes  = allRows.filter(r => r.status === 'Pendente').length;
    const semResposta = (window.GRUPOS ? Object.values(window.GRUPOS).reduce((a,g) => a + g.membros.length, 0) : 0) - total;

    setText('stat-total',      total);
    setText('stat-confirmados', confirmados);
    setText('stat-naovao',     naoVao);
    setText('stat-pendentes',  pendentes);
    setText('stat-semresposta', Math.max(0, semResposta));

    // Progress bar
    const totalConvidados = window.GRUPOS ? Object.values(window.GRUPOS).reduce((a,g) => a + g.membros.length, 0) : 1;
    const pct = Math.round((confirmados / totalConvidados) * 100);
    const bar = document.getElementById('progress-confirmados');
    if (bar) bar.style.width = pct + '%';
    setText('progress-pct', pct + '%');
  }

  /* ── TABLE ── */
  function renderTable() {
    const tbody = document.getElementById('results-body');
    if (!tbody) return;

    const filtered = allRows.filter(r => {
      const matchStatus = filterStatus === 'all' || r.status.toLowerCase().includes(filterStatus);
      const matchSearch = !searchTerm || r.nome.toLowerCase().includes(searchTerm) || r.grupoId.toLowerCase().includes(searchTerm);
      return matchStatus && matchSearch;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="dash-empty">Nenhum resultado encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(r => `
      <tr>
        <td class="dash-name">${r.nome}</td>
        <td class="dash-grupo hide-mobile">${labelFromId(r.grupoId)}</td>
        <td><span class="dash-badge ${badgeClass(r.status)}">${r.status}</span></td>
        <td class="dash-date hide-mobile">${formatDate(r.ultimaAtt)}</td>
      </tr>`).join('');
  }

  /* ── HELPERS ── */
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function showSpinner(on) {
    const el = document.getElementById('dash-spinner');
    if (el) el.style.display = on ? 'flex' : 'none';
  }
  function showError(msg) {
    const el = document.getElementById('dash-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function badgeClass(status) {
    if (status === 'Confirmado') return 'badge-yes';
    if (status === 'Não vai')    return 'badge-no';
    return 'badge-pending';
  }
  function formatDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  }
  function labelFromId(id) {
    return window.GRUPOS?.[id]?.label || id;
  }

})();
