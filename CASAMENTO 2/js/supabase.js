/* ══════════════════════════════════════════════════════════════
   SUPABASE CONFIG — Isabella & Samuel
   ══════════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://buqaljroqudziitboxdi.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cWFsanJvcXVkemlpdGJveGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjIxNzksImV4cCI6MjA4OTQzODE3OX0.NarWn77hCoV1Q38s_vUakkJpw6ggpXWcwzCRKt9uYFw';
const SITE_BASE_URL = 'https://osallesdsg-ui.github.io/casamento-isabella-samuel';

/* Expõe tudo via window.SB — sem poluir escopo global */
window.SB = (function () {
  async function _fetch(table, options = {}) {
    const { method = 'GET', filter = '', body = null, select = '*' } = options;
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter ? '&' + filter : ''}`;
    const res = await fetch(url, {
      method,
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
      },
      body: body ? JSON.stringify(body) : null
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  return {
    sbSelect: (table, filter = '', select = '*') => _fetch(table, { filter, select }),
    sbInsert: (table, data)               => _fetch(table, { method: 'POST',   body: data }),
    sbUpdate: (table, filter, data)       => _fetch(table, { method: 'PATCH',  filter, body: data }),
    sbDelete: (table, filter)             => _fetch(table, { method: 'DELETE', filter }),
  };
})();
