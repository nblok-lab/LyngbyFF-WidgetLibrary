const base = (() => {
  // Finder basis-URL for GitHub Pages (https://USERNAME.github.io/REPO/) eller lokal udvikling.
  const { origin, pathname } = window.location;
  // Hvis host indeholder github.io, antag at /REPO/ er første path-segment
  if (origin.includes('github.io')) {
    const segs = pathname.split('/').filter(Boolean);
    const repo = segs.length ? '/' + segs[0] + '/' : '/';
    return origin + repo;
  }
  // Lokal udvikling
  return origin + '/';
})();

function scrollToId(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
function closeModal() { document.getElementById('modal').close(); }
function openModal(title, html) {
  const m = document.getElementById('modal');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-content').innerHTML = html;
  if (!m.open) m.showModal();
}

function codeBlock(str) {
  return `<pre class="code"><code>${str.replace(/[&<>]/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[s]))}</code></pre>`;
}

function embedSnippet(id) {
  const src = `${base}widgets/${id}.html`;
  // Simpelt embed: iframe. Alternativt kan du lave <script>-based embeds.
  return `<!-- Indlejr ${id} -->\n<iframe src="${src}" title="${id}" loading="lazy" style="width:100%;border:0;min-height:360px;"></iframe>`;
}

// Event delegation for knapper
document.getElementById('grid').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const card = e.target.closest('.card');
  const id = card.dataset.widgetId;
  const file = card.dataset.file;
  const title = card.querySelector('h3').textContent;

  if (btn.dataset.action === 'demo') {
    openModal(title + ' · Demo', `<iframe src="${base}${file}" style="width:100%;height:60vh;border:0;border-radius:12px"></iframe>`);
  }
  if (btn.dataset.action === 'code') {
    try {
      const res = await fetch(`${base}${file}`);
      const txt = await res.text();
      openModal(title + ' · Kode', codeBlock(txt));
    } catch (err) {
      openModal(title + ' · Kode', `<p>Kunne ikke hente kilde: ${file}</p>`);
    }
  }
  if (btn.dataset.action === 'embed') {
    const idMap = { 'six-cards': 'six-cards', 'match-banner': 'match-banner' };
    const snippet = embedSnippet(idMap[id] || id);
    const html = `
      <div class="copyline">
        <button class="btn" id="copyBtn">Kopiér</button>
        <span style="color:var(--muted)">Sæt ind i Holdsport som HTML-indhold</span>
      </div>
      ${codeBlock(snippet)}
    `;
    openModal(title + ' · Indlejr', html);
    setTimeout(() => {
      const btn = document.getElementById('copyBtn');
      btn?.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(snippet); btn.textContent = 'Kopieret!'; } catch { btn.textContent = 'Kunne ikke kopiere'; }
      });
    }, 50);
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

