// Peças reutilizadas pelos exemplos. HTML simples, sem framework.
import { processos } from './dados.js';

export const el = (html) => { const t = document.createElement('div'); t.innerHTML = html.trim(); return t.firstElementChild; };
export const status = ([txt, tipo]) => `<span class="lab-status lab-status--${tipo}">${txt}</span>`;
const n = (v) => v.toLocaleString('pt-BR');

/** Tabela de processos. select: checkbox por linha; abrir: o link do assunto abre o detalhe. */
export function tabelaProcessos({ select = false, caption = 'Processos da unidade', linhas = processos } = {}) {
  return `
  <div class="lab-table-wrap" tabindex="0" aria-label="${caption}">
    <table class="lab-table">
      <caption>${caption} <span class="muted">(${linhas.length})</span></caption>
      <thead><tr>
        ${select ? '<th class="col-check" scope="col"><input type="checkbox" data-all aria-label="Selecionar todos os processos da página"></th>' : ''}
        <th scope="col" aria-sort="none"><button class="sort" data-key="assunto">Assunto</button></th>
        <th scope="col">Processo</th>
        <th scope="col" aria-sort="none"><button class="sort" data-key="orgao">Órgão</button></th>
        <th scope="col">Responsável</th>
        <th scope="col" class="num" aria-sort="none"><button class="sort" data-key="dias">Dias</button></th>
        <th scope="col">Situação</th>
      </tr></thead>
      <tbody>
        ${linhas.map((p) => `
        <tr data-id="${p.id}" data-assunto="${p.assunto}" data-orgao="${p.orgao}" data-dias="${p.dias}">
          ${select ? `<td><input type="checkbox" data-row aria-label="Selecionar ${p.assunto}, processo ${p.id}"></td>` : ''}
          <td><button class="link-row" data-abrir="${p.id}">${p.assunto}</button></td>
          <td>${p.id}</td><td>${p.orgao}</td><td>${p.responsavel}</td>
          <td class="num">${p.dias}</td><td>${status(p.status)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  <p class="sr-only" aria-live="polite" data-anuncio></p>`;
}

/** Ordenação por clique no cabeçalho, com aria-sort e anúncio para leitor de tela. */
export function ligarOrdenacao(root) {
  root.querySelectorAll('.sort').forEach((b) => b.addEventListener('click', () => {
    const th = b.closest('th'); const key = b.dataset.key;
    const asc = th.getAttribute('aria-sort') !== 'ascending';
    root.querySelectorAll('th[aria-sort]').forEach((t) => t.setAttribute('aria-sort', 'none'));
    th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
    const tbody = root.querySelector('tbody');
    const rows = [...tbody.rows].sort((a, z) => {
      const x = a.dataset[key], y = z.dataset[key];
      const r = isNaN(x) ? x.localeCompare(y, 'pt-BR') : x - y;
      return asc ? r : -r;
    });
    rows.forEach((r) => tbody.appendChild(r));
    const an = root.querySelector('[data-anuncio]');
    if (an) an.textContent = `Ordenado por ${b.textContent}, ${asc ? 'crescente' : 'decrescente'}.`;
  }));
}

/** Seleção: checkbox de 3 estados no cabeçalho e barra de ações em lote com a contagem. */
export function ligarSelecao(root) {
  const all = root.querySelector('[data-all]'); const rows = [...root.querySelectorAll('[data-row]')];
  const bar = root.querySelector('.lab-batch'); const count = root.querySelector('.lab-batch .count');
  const sync = () => {
    const k = rows.filter((r) => r.checked).length;
    rows.forEach((r) => r.closest('tr').setAttribute('aria-selected', r.checked));
    all.checked = k === rows.length; all.indeterminate = k > 0 && k < rows.length;
    if (bar) { bar.classList.toggle('is-on', k > 0); count.textContent = `${k} selecionado${k > 1 ? 's' : ''}`; }
    root.querySelectorAll('[data-abrir]').forEach((a) => { a.tabIndex = k ? -1 : 0; a.style.pointerEvents = k ? 'none' : ''; });
  };
  all.addEventListener('change', () => { rows.forEach((r) => { r.checked = all.checked; }); sync(); });
  rows.forEach((r) => r.addEventListener('change', sync));
  root.querySelector('[data-cancelar]')?.addEventListener('click', () => { all.checked = false; all.dispatchEvent(new Event('change')); });
}

/** Barra de ações em lote (fica escondida até marcar um item). */
export const barraLote = () => `
  <div class="lab-batch" role="region" aria-label="Ações em lote">
    <span class="count">0 selecionados</span>
    <button class="lab-btn">Encaminhar</button>
    <button class="lab-btn">Atribuir responsável</button>
    <button class="lab-btn">Arquivar</button>
    <span class="spacer" style="flex:1"></span>
    <button class="lab-btn lab-btn--ghost" data-cancelar>Cancelar</button>
  </div>`;

/** Toolbar: busca → filtros → ações (até 2) → contagem, na ordem do PatternFly. */
export const toolbar = ({ chips = true } = {}) => `
  <div class="lab-toolbar" role="toolbar" aria-label="Ferramentas da lista de processos">
    <label class="sr-only" for="busca">Buscar processo</label>
    <input id="busca" class="lab-input" type="search" placeholder="Buscar por assunto ou número">
    <label class="sr-only" for="f-org">Órgão</label>
    <select id="f-org" class="lab-select"><option>Órgão: todos</option><option>SEGOV</option><option>SEFAZ</option></select>
    <label class="sr-only" for="f-sit">Situação</label>
    <select id="f-sit" class="lab-select"><option>Situação: em aberto</option><option>Todas</option></select>
    <span class="spacer"></span>
    <button class="lab-btn">Exportar</button>
    <button class="lab-btn lab-btn--primary">Novo processo</button>
  </div>
  ${chips ? `<div class="lab-chips" aria-label="Filtros aplicados">
    <span class="muted" style="font-size:12px">Filtros:</span>
    <span class="lab-chip">Situação: em aberto <button aria-label="Remover filtro Situação: em aberto">×</button></span>
    <span class="lab-chip">Entrada: últimos 30 dias <button aria-label="Remover filtro Entrada: últimos 30 dias">×</button></span>
    <button class="lab-btn lab-btn--ghost lab-btn--sm">Limpar filtros</button>
  </div>` : ''}`;

/** Painel de detalhe (master-detail). */
export function ligarDetalhe(root) {
  const md = root.querySelector('.lab-md'); const panel = root.querySelector('.lab-panel');
  const abrir = (id) => {
    const p = processos.find((x) => x.id === id);
    root.querySelectorAll('tbody tr').forEach((tr) => tr.setAttribute('aria-current', tr.dataset.id === id ? 'true' : 'false'));
    root.querySelectorAll('tbody tr').forEach((tr) => { tr.style.background = tr.dataset.id === id ? 'var(--ds-color-accent-soft)' : ''; });
    panel.querySelector('h2').textContent = p.assunto;
    panel.querySelector('.body').innerHTML = `
      <dl><dt>Processo</dt><dd>${p.id}</dd><dt>Órgão</dt><dd>${p.orgao}</dd><dt>Responsável</dt><dd>${p.responsavel}</dd>
      <dt>Entrada</dt><dd>${p.entrada}</dd><dt>Situação</dt><dd>${status(p.status)}</dd></dl>
      <label class="lab-field">Despacho<textarea class="lab-input" rows="3" style="height:auto;padding:8px 12px"></textarea></label>
      <div style="display:flex;gap:8px"><button class="lab-btn lab-btn--primary">Salvar despacho</button><button class="lab-btn">Encaminhar</button></div>`;
    md.classList.add('is-open'); panel.querySelector('h2').focus();
  };
  root.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () => abrir(b.dataset.abrir)));
  panel.querySelector('[data-fechar]').addEventListener('click', () => { md.classList.remove('is-open'); });
  return abrir;
}

export const painelDetalhe = () => `
  <aside class="lab-panel" aria-label="Detalhe do processo">
    <header><h2 tabindex="-1">Processo</h2><button class="lab-btn lab-btn--ghost lab-btn--sm" data-fechar aria-label="Fechar detalhe">✕</button></header>
    <div class="body"></div>
  </aside>`;

/* ---------- Gráficos em SVG simples ---------- */
const COR = (i) => `var(--lab-data-${i + 1})`;

export function barrasH(dados, { max = Math.max(...dados.map((d) => d[1])) } = {}) {
  const h = dados.length * 34 + 10, w = 520, x0 = 80;
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true">
    ${dados.map(([nome, v], i) => {
      const y = 6 + i * 34, bw = ((w - x0 - 60) * v) / max;
      return `<text x="${x0 - 8}" y="${y + 17}" text-anchor="end">${nome}</text>
        <rect x="${x0}" y="${y + 4}" width="${bw}" height="20" rx="3" fill="${COR(0)}"></rect>
        <text x="${x0 + bw + 6}" y="${y + 18}">${n(v)}</text>`;
    }).join('')}
  </svg>`;
}

export function linhas(series, rotulos) {
  const w = 520, h = 220, x0 = 48, y0 = 190, top = 16;
  const todos = Object.values(series).flat(); const max = Math.ceil(Math.max(...todos) / 4000) * 4000;
  const X = (i) => x0 + (i * (w - x0 - 70)) / (rotulos.length - 1); const Y = (v) => y0 - ((y0 - top) * v) / max;
  const grade = [0, max / 2, max].map((v) => `<line x1="${x0}" x2="${w - 70}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--ds-color-border)"></line><text x="${x0 - 6}" y="${Y(v) + 4}" text-anchor="end">${n(v / 1000)} mil</text>`).join('');
  const eixoX = rotulos.map((r, i) => `<text x="${X(i)}" y="${y0 + 18}" text-anchor="middle">${r}</text>`).join('');
  const ss = Object.entries(series).map(([nome, vs], k) => {
    const d = vs.map((v, i) => `${i ? 'L' : 'M'}${X(i)},${Y(v)}`).join(' ');
    const last = vs.length - 1;
    return `<path d="${d}" fill="none" stroke="${COR(k)}" stroke-width="3" ${k ? 'stroke-dasharray="6 4"' : ''}></path>
      ${vs.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="${COR(k)}"></circle>`).join('')}
      <text x="${X(last) + 8}" y="${Y(vs[last]) + 4}" style="fill:${COR(k)};font-weight:600">${nome}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h + 10}" role="img" aria-hidden="true">${grade}${eixoX}${ss}</svg>`;
}

/** Contêiner de gráfico: título com o achado, subtítulo, corpo, ver como tabela e metadados. */
export const conteiner = ({ titulo, sub, svg, legenda = '', tabela, fonte, atualizado, metodo }) => `
  <figure class="lab-chart" style="margin:0">
    <header><div><h3>${titulo}</h3><p>${sub}</p></div>
      <button class="lab-btn lab-btn--ghost lab-btn--sm">Baixar CSV</button></header>
    <div class="body">${svg}</div>
    ${legenda}
    <details><summary>Ver como tabela</summary>${tabela}</details>
    <footer><span><b>Fonte:</b> ${fonte}</span><span><b>Atualizado em:</b> ${atualizado}</span>${metodo ? `<span><b>Método:</b> ${metodo}</span>` : ''}</footer>
  </figure>`;

export const tabelaSimples = (cab, linhas, caption) => `
  <table class="lab-table" style="margin-top:8px"><caption class="sr-only">${caption}</caption>
    <thead><tr>${cab.map((c, i) => `<th scope="col"${i ? ' class="num"' : ''}>${c}</th>`).join('')}</tr></thead>
    <tbody>${linhas.map((l) => `<tr>${l.map((c, i) => (i ? `<td class="num">${typeof c === 'number' ? n(c) : c}</td>` : `<th scope="row">${c}</th>`)).join('')}</tr>`).join('')}</tbody>
  </table>`;

/* ---------- Moldura de sistema (ds-topbar + ds-app-bar + ds-menu + ds-info-system) ---------- */
const ICONE = {
  sino: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  apps: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  ajuda: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
};

/** base: caminho até a raiz do lab ('' nas stories, '../../' nas POCs). menu: [[rótulo, href, atual]]. */
export function moldura({ base = '', sistema, orgao = 'SEGOV', usuario = 'Ana Ribeiro', menu = null, conteudo = '', versao = '0.1.0' }) {
  const iniciais = usuario.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return `
  <div class="lab-shell${menu ? '' : ' lab-shell--sem-menu'}">
    <div class="lab-govbar">
      <a class="lab-selo" href="https://www.ms.gov.br" target="_blank" rel="noopener">ms.gov.br</a>
      <span class="spacer"></span>
      <a href="https://www.ouvidoria.ms.gov.br" target="_blank" rel="noopener">Ouvidoria</a>
      <a href="https://www.transparencia.ms.gov.br" target="_blank" rel="noopener">Transparência</a>
    </div>
    <header class="lab-appbar">
      ${menu ? `<button class="lab-icone lab-menu-btn" aria-label="Abrir o menu" aria-expanded="false" onclick="const sh=this.closest('.lab-shell');const ab=sh.classList.toggle('menu-aberto');this.setAttribute('aria-expanded',ab)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>` : ''}
      <a class="marca" href="#/"><img src="${base}shared/brasao-ms.svg" alt=""><span>${sistema}<small>Governo de Mato Grosso do Sul · ${orgao}</small></span></a>
      <div class="busca"><label class="sr-only" for="busca-global">Buscar no sistema</label><input id="busca-global" class="lab-input" type="search" placeholder="Buscar no sistema"></div>
      <div class="icones">
        <button class="lab-icone" aria-label="Notificações, 3 novas">${ICONE.sino}<span class="bolha" aria-hidden="true">3</span></button>
        <button class="lab-icone" aria-label="Outros sistemas">${ICONE.apps}</button>
        <button class="lab-icone" aria-label="Ajuda">${ICONE.ajuda}</button>
      </div>
      <div class="lab-conta"><span class="lab-avatar" aria-hidden="true">${iniciais}</span><span>${usuario}</span></div>
    </header>
    ${menu ? `<div class="lab-veu" onclick="this.closest('.lab-shell').classList.remove('menu-aberto')"></div>
    <nav class="lab-side" aria-label="Menu do sistema" onclick="if(event.target.closest('a'))this.closest('.lab-shell').classList.remove('menu-aberto')"><div class="titulo">Menu</div>${menu.map(([r, h, atual]) => `<a href="${h}"${atual ? ' aria-current="page"' : ''}>${r}</a>`).join('')}</nav>` : ''}
    <main class="lab-main" id="conteudo">${conteudo}</main>
    <footer class="lab-infosys">IP: 10.5.6.172 &nbsp;|&nbsp; ${sistema} versão ${versao} &nbsp;|&nbsp; Publicado em 25/11/2026 &nbsp;|&nbsp; HOM · dados fictícios</footer>
  </div>`;
}
