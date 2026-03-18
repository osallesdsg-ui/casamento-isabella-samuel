# 💍 Casamento Isabella & Samuel — Site

## Estrutura do Projeto

```
casamento-isabella-samuel/
├── index.html          → Convite + RSVP (página principal)
├── dashboard.html      → Dashboard de confirmações (privado)
├── css/
│   └── styles.css      → Estilos compartilhados
├── js/
│   ├── groups.js       → Lista completa de grupos/convidados
│   ├── rsvp.js         → Lógica de confirmação de presença
│   ├── countdown.js    → Contagem regressiva
│   └── dashboard.js    → Lógica do dashboard
└── img/
    └── foto-noivos.jpg → Foto dos noivos (ADICIONAR MANUALMENTE)
```

## ⚠️ Antes de subir no GitHub

### 1. Foto dos noivos
Coloque a foto na pasta `img/` com o nome **`foto-noivos.jpg`**.
Recomendado: resolução 1920×1080px ou maior, orientação paisagem, formato JPG comprimido (~300-600KB).

### 2. Verificar App Script URL
Em `js/rsvp.js`, confirme que a constante `SCRIPT_URL` está com a URL correta do Google Apps Script.

### 3. Verificar CSV URL do Dashboard
Em `js/dashboard.js`, confirme que a constante `CSV_URL` está com a URL do CSV público do Google Sheets.

---

## 🚀 Como subir no GitHub Pages

1. Faça upload de TODOS os arquivos e pastas no repositório `casamento-isabella-samuel`
2. Vá em **Settings → Pages → Branch: main → Save**
3. Aguarde 1-2 min e acesse: `https://osallesdsg-ui.github.io/casamento-isabella-samuel`

### URLs dos links personalizados
```
https://osallesdsg-ui.github.io/casamento-isabella-samuel?g=ID_DO_GRUPO
```

Exemplo:
```
https://osallesdsg-ui.github.io/casamento-isabella-samuel?g=amigos_johnnie_yasmin
```

### Dashboard
```
https://osallesdsg-ui.github.io/casamento-isabella-samuel/dashboard.html
```

---

## 📋 Como atualizar a lista de convidados

Edite apenas o arquivo `js/groups.js` e faça o upload novamente no GitHub.
Não é necessário mexer em nenhum outro arquivo.

---

## ✏️ Como atualizar o Apps Script

Se precisar republicar o Apps Script (após editar):
1. Acesse `script.google.com`
2. Abra o projeto do casamento
3. **Implantar → Gerenciar implantações → ✏️ → Nova versão → Implantar**
4. O link permanece o mesmo — não precisa atualizar o site.

---

## 📅 Datas importantes

- **Prazo de confirmação:** 20 de março de 2026
- **Data do casamento:** 07 de novembro de 2026, 16h30
- **Local:** Espaço Carrier — Mairiporã, SP
