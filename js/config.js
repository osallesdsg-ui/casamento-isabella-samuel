/* ══════════════════════════════════════════════════════════════
   CONFIG — Isabella & Samuel
   Carrega configurações do Supabase (prazos, rodada ativa)
   e expõe via window.CONFIG
   ══════════════════════════════════════════════════════════════ */

window.CONFIG = {
  prazo_rodada_1: '2026-03-20T23:59:00',
  prazo_rodada_2: '2026-06-01T23:59:00',
  prazo_rodada_3: '2026-09-01T23:59:00',
  rodada_ativa:   '1',
  loaded: false,

  /* Retorna o prazo da rodada ativa como objeto Date */
  get prazoAtivo() {
    const r = this.rodada_ativa || '1';
    const val = this[`prazo_rodada_${r}`];
    return val ? new Date(val) : null;
  },

  /* Retorna true se o prazo já passou */
  get isPastDeadline() {
    const p = this.prazoAtivo;
    return p ? new Date() > p : false;
  },

  /* Formata o prazo para exibição — ex: "20 de março de 2026 às 23h59" */
  get prazoFormatado() {
    const p = this.prazoAtivo;
    if (!p) return '';
    const meses = ['janeiro','fevereiro','março','abril','maio','junho',
                   'julho','agosto','setembro','outubro','novembro','dezembro'];
    const d = p.getDate();
    const m = meses[p.getMonth()];
    const y = p.getFullYear();
    const h = String(p.getHours()).padStart(2,'0');
    const min = String(p.getMinutes()).padStart(2,'0');
    return `${d} de ${m} de ${y} às ${h}h${min}`;
  }
};

/* Carrega do Supabase e atualiza */
(async function loadConfig() {
  try {
    const URL = 'https://buqaljroqudziitboxdi.supabase.co';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cWFsanJvcXVkemlpdGJveGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjIxNzksImV4cCI6MjA4OTQzODE3OX0.NarWn77hCoV1Q38s_vUakkJpw6ggpXWcwzCRKt9uYFw';

    const res  = await fetch(`${URL}/rest/v1/configuracoes?select=chave,valor`, {
      headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
    });
    const rows = await res.json();

    if (Array.isArray(rows)) {
      rows.forEach(r => { window.CONFIG[r.chave] = r.valor; });
    }
  } catch(e) {
    console.warn('Config: usando valores padrão.', e);
  } finally {
    window.CONFIG.loaded = true;
    window.dispatchEvent(new Event('config-loaded'));
  }
})();
