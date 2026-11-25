// SIGEP — POC de sistema interno feito com o Design System MS (dados fictícios).
// Rotas por hash: #/inicio, #/processos, #/processos/novo, #/processos/<id>/editar
import { moldura, status } from '../../shared/ui.js';
import { gerarProcessos, SITUACOES, ORGAOS, PESSOAS, ASSUNTOS } from '../../shared/dados.js';

const CHAVE = 'sigep-poc-processos';
const app = document.getElementById('app');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Dados (localStorage, se o navegador deixar) ---------- */
let processos = carregar();
function carregar() { try { const s = localStorage.getItem(CHAVE); if (s) return JSON.parse(s); } catch { /* sem storage */ } return gerarProcessos(); }
function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(processos)); } catch { /* sem storage: só na memória */ } }

/* ---------- Estado da lista ---------- */
const lista = { busca: '', orgao: '', situacao: '', ordem: ['entrada', -1], pagina: 1, sel: new Set(), aberto: null };
const POR_PAGINA = 10;

/* ---------- Aviso (toast) ---------- */
let toastTimer;
function avisar(msg, desfazer) {
  const t = document.getElementById('toast');
  t.innerHTML = `<span>${esc(msg)}</span>${desfazer ? '<button type="button">Desfazer</button>' : ''}`;
  t.classList.add('on');
  if (desfazer) t.querySelector('button').onclick = () => { desfazer(); t.classList.remove('on'); };
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 6000);
}

/* ---------- Roteador ---------- */
const MENU = [['Início', '#/inicio'], ['Processos', '#/processos'], ['Novo processo', '#/processos/novo'], ['Relatórios', '#/relatorios'], ['Configurações', '#/config']];
function render() {
  const rota = location.hash.slice(1) || '/inicio';
  let atual = '#/inicio', html, depois;
  if (rota === '/inicio') [html, depois] = inicio();
  else if (rota === '/processos') { atual = '#/processos'; [html, depois] = listagem(); }
  else if (rota === '/processos/novo') { atual = '#/processos/novo'; [html, depois] = formulario(); }
  else if (/^\/processos\/.+\/editar$/.test(rota)) { atual = '#/processos'; [html, depois] = formulario(decodeURIComponent(rota.split('/')[2]).replace('-', '/')); }
  else { atual = '#' + rota; html = `<h1>${rota === '/relatorios' ? 'Relatórios' : 'Configurações'}</h1><div class="lab-card vazio"><b>Página fora desta POC</b>A POC mostra o início, a listagem e o cadastro.${rota === '/config' ? '<p><button class="lab-btn" data-restaurar>Restaurar dados de exemplo</button></p>' : ''}</div>`;
    depois = () => app.querySelector('[data-restaurar]')?.addEventListener('click', () => { processos = gerarProcessos(); salvar(); avisar('Dados de exemplo restaurados.'); }); }
  app.innerHTML = moldura({ base: '../../', sistema: 'SIGEP', orgao: 'SEGOV', menu: MENU.map(([r, h]) => [r, h, h === atual]), conteudo: html });
  app.querySelector('.lab-appbar .marca').setAttribute('href', '#/inicio');
  app.querySelector('.lab-appbar .marca span').firstChild.textContent = 'SIGEP — Gestão de Processos';
  depois?.();
  document.title = `${app.querySelector('h1')?.textContent || 'SIGEP'} — SIGEP (POC)`;
}
let manterAberto = false; // depois de salvar, a lista abre com o processo no detalhe
window.addEventListener('hashchange', () => { if (!manterAberto) lista.aberto = null; manterAberto = false; render(); window.scrollTo(0, 0); });

/* ---------- Início ---------- */
function inicio() {
  const conta = (s) => processos.filter((p) => p.situacao === s).length;
  const html = `
    <div class="lab-trilha">Início</div>
    <div class="cabeca"><div><h1>Bom dia, Ana</h1><p class="muted" style="margin:4px 0 0">Resumo dos processos da SEGOV</p></div>
      <a class="lab-btn lab-btn--primary" href="#/processos/novo">Novo processo</a></div>
    <section class="contadores" aria-label="Processos por situação">
      ${Object.keys(SITUACOES).map((s) => `<a href="#/processos" data-sit="${s}"><div class="lab-kpi"><span class="label">${s}</span><span class="value">${conta(s)}</span><span class="meta">Ver a lista →</span></div></a>`).join('')}
    </section>
    <div class="lab-card"><h2 style="margin-bottom:8px">Atrasados</h2>
      ${tabela(processos.filter((p) => p.situacao === 'Atrasado').slice(0, 5), false, 'Processos atrasados')}</div>`;
  return [html, () => app.querySelectorAll('[data-sit]').forEach((a) => a.addEventListener('click', () => { Object.assign(lista, { situacao: a.dataset.sit, pagina: 1 }); }))];
}

/* ---------- Listagem ---------- */
function filtrados() {
  const b = lista.busca.toLowerCase();
  const [k, d] = lista.ordem;
  const chave = (p) => (k === 'entrada' ? p.entrada.split('/').reverse().join('') : p[k]);
  return processos
    .filter((p) => (!b || `${p.assunto} ${p.id} ${p.interessado}`.toLowerCase().includes(b)) && (!lista.orgao || p.orgao === lista.orgao) && (!lista.situacao || p.situacao === lista.situacao))
    .sort((a, z) => String(chave(a)).localeCompare(String(chave(z)), 'pt-BR') * d);
}

function tabela(linhas, selecao, caption) {
  const th = (k, r) => { const [ok, d] = lista.ordem; const s = ok === k ? (d > 0 ? 'ascending' : 'descending') : 'none'; return `<th scope="col" aria-sort="${s}"><button class="sort" data-ordem="${k}">${r}</button></th>`; };
  const todos = linhas.length && linhas.every((p) => lista.sel.has(p.id));
  return `<div class="lab-table-wrap"><table class="lab-table"><caption class="sr-only">${caption}</caption><thead><tr>
    ${selecao ? `<th class="col-check" scope="col"><input type="checkbox" data-todos ${todos ? 'checked' : ''} aria-label="Selecionar todos os processos desta página"></th>` : ''}
    ${th('assunto', 'Assunto')}${th('id', 'Processo')}${th('orgao', 'Órgão')}<th scope="col">Interessado</th>${th('entrada', 'Entrada')}<th scope="col">Situação</th>
  </tr></thead><tbody>
    ${linhas.map((p) => `<tr aria-selected="${lista.sel.has(p.id)}"${lista.aberto === p.id ? ' aria-current="true" style="background:var(--ds-color-accent-soft)"' : ''}>
      ${selecao ? `<td><input type="checkbox" data-sel="${p.id}" ${lista.sel.has(p.id) ? 'checked' : ''} aria-label="Selecionar ${esc(p.assunto)}, processo ${p.id}"></td>` : ''}
      <td><button class="link-row" data-abrir="${p.id}">${esc(p.assunto)}</button></td><td>${p.id}</td><td>${p.orgao}</td><td>${esc(p.interessado)}</td><td>${p.entrada}</td><td>${status([p.situacao, SITUACOES[p.situacao]])}</td>
    </tr>`).join('')}
  </tbody></table></div>`;
}

function listagem() {
  const todos = filtrados();
  const paginas = Math.max(1, Math.ceil(todos.length / POR_PAGINA));
  lista.pagina = Math.min(lista.pagina, paginas);
  const pag = todos.slice((lista.pagina - 1) * POR_PAGINA, lista.pagina * POR_PAGINA);
  const chips = [lista.busca && ['busca', `Busca: ${lista.busca}`], lista.orgao && ['orgao', `Órgão: ${lista.orgao}`], lista.situacao && ['situacao', `Situação: ${lista.situacao}`]].filter(Boolean);
  const p = processos.find((x) => x.id === lista.aberto);
  const html = `
    <div class="lab-trilha"><a href="#/inicio">Início</a> › Processos</div>
    <div class="cabeca"><h1>Processos</h1></div>
    <div class="lab-card" style="padding:12px 16px">
      <div class="lab-batch ${lista.sel.size ? 'is-on' : ''}" role="region" aria-label="Ações em lote">
        <span class="count">${lista.sel.size} selecionado${lista.sel.size > 1 ? 's' : ''}</span>
        <button class="lab-btn" data-lote="Em análise">Encaminhar para análise</button>
        <button class="lab-btn" data-lote="Arquivado">Arquivar</button>
        <span style="flex:1"></span><button class="lab-btn lab-btn--ghost" data-cancelar>Cancelar</button>
      </div>
      <div class="lab-toolbar" role="toolbar" aria-label="Ferramentas da lista" ${lista.sel.size ? 'hidden' : ''}>
        <label class="sr-only" for="f-busca">Buscar</label><input id="f-busca" class="lab-input" type="search" placeholder="Buscar por assunto, número ou interessado" value="${esc(lista.busca)}">
        <label class="sr-only" for="f-orgao">Órgão</label><select id="f-orgao" class="lab-select"><option value="">Órgão: todos</option>${ORGAOS.map((o) => `<option ${o === lista.orgao ? 'selected' : ''}>${o}</option>`).join('')}</select>
        <label class="sr-only" for="f-sit">Situação</label><select id="f-sit" class="lab-select"><option value="">Situação: todas</option>${Object.keys(SITUACOES).map((s) => `<option ${s === lista.situacao ? 'selected' : ''}>${s}</option>`).join('')}</select>
        <span class="spacer"></span>
        <button class="lab-btn" data-exportar>Exportar CSV</button>
        <a class="lab-btn lab-btn--primary" href="#/processos/novo">Novo processo</a>
      </div>
      ${chips.length ? `<div class="lab-chips" aria-label="Filtros aplicados" style="margin-bottom:8px"><span class="muted" style="font-size:12px">Filtros:</span>
        ${chips.map(([k, t]) => `<span class="lab-chip">${esc(t)} <button data-tirar="${k}" aria-label="Remover filtro ${esc(t)}">×</button></span>`).join('')}
        <button class="lab-btn lab-btn--ghost lab-btn--sm" data-limpar>Limpar filtros</button></div>` : ''}
      <div class="lab-md ${p ? 'is-open' : ''}">
        <div>
          ${todos.length ? tabela(pag, true, 'Processos') : `<div class="vazio"><b>Nenhum processo com esses filtros</b>Mude a busca ou os filtros. <button class="lab-btn lab-btn--sm" data-limpar style="margin-left:6px">Limpar filtros</button></div>`}
          <div class="paginacao"><span aria-live="polite">${todos.length ? `${(lista.pagina - 1) * POR_PAGINA + 1}–${(lista.pagina - 1) * POR_PAGINA + pag.length} de ${todos.length} processos` : '0 processos'}</span>
            <span class="botoes"><button class="lab-btn lab-btn--sm" data-pag="-1" ${lista.pagina === 1 ? 'disabled' : ''}>Anterior</button><span style="padding:4px 8px">Página ${lista.pagina} de ${paginas}</span><button class="lab-btn lab-btn--sm" data-pag="1" ${lista.pagina === paginas ? 'disabled' : ''}>Próxima</button></span></div>
        </div>
        ${p ? `<aside class="lab-panel" aria-label="Detalhe do processo">
          <header><h2 tabindex="-1" id="det-t">${esc(p.assunto)}</h2><button class="lab-btn lab-btn--ghost lab-btn--sm" data-fechar aria-label="Fechar detalhe">✕</button></header>
          <div class="body"><dl><dt>Processo</dt><dd>${p.id}</dd><dt>Órgão</dt><dd>${p.orgao}</dd><dt>Interessado</dt><dd>${esc(p.interessado)}</dd><dt>Responsável</dt><dd>${esc(p.responsavel)}</dd><dt>Entrada</dt><dd>${p.entrada}</dd><dt>Situação</dt><dd>${status([p.situacao, SITUACOES[p.situacao]])}</dd></dl>
            <p style="margin:0">${esc(p.descricao)}</p>
            <div style="display:flex;gap:8px"><a class="lab-btn lab-btn--primary" href="#/processos/${p.id.replace('/', '-')}/editar">Editar</a><button class="lab-btn" data-excluir="${p.id}">Excluir</button></div></div>
        </aside>` : ''}
      </div>
    </div>`;
  return [html, ligarLista];
}

function ligarLista() {
  const re = () => render();
  const deb = (fn) => { let t; return (e) => { clearTimeout(t); t = setTimeout(() => fn(e), 250); }; };
  const busca = app.querySelector('#f-busca');
  busca?.addEventListener('input', deb((e) => { lista.busca = e.target.value; lista.pagina = 1; re(); app.querySelector('#f-busca').focus(); const i = app.querySelector('#f-busca'); i.setSelectionRange(i.value.length, i.value.length); }));
  app.querySelector('#f-orgao')?.addEventListener('change', (e) => { lista.orgao = e.target.value; lista.pagina = 1; re(); });
  app.querySelector('#f-sit')?.addEventListener('change', (e) => { lista.situacao = e.target.value; lista.pagina = 1; re(); });
  app.querySelectorAll('[data-tirar]').forEach((b) => b.addEventListener('click', () => { lista[b.dataset.tirar] = ''; re(); }));
  app.querySelectorAll('[data-limpar]').forEach((b) => b.addEventListener('click', () => { Object.assign(lista, { busca: '', orgao: '', situacao: '', pagina: 1 }); re(); }));
  app.querySelectorAll('[data-ordem]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ordem; lista.ordem = [k, lista.ordem[0] === k ? -lista.ordem[1] : 1]; re(); }));
  app.querySelectorAll('[data-pag]').forEach((b) => b.addEventListener('click', () => { lista.pagina += +b.dataset.pag; re(); }));
  app.querySelectorAll('[data-sel]').forEach((c) => c.addEventListener('change', () => { c.checked ? lista.sel.add(c.dataset.sel) : lista.sel.delete(c.dataset.sel); re(); }));
  const todos = app.querySelector('[data-todos]');
  if (todos) {
    const ids = [...app.querySelectorAll('[data-sel]')].map((c) => c.dataset.sel);
    const k = ids.filter((i) => lista.sel.has(i)).length; todos.indeterminate = k > 0 && k < ids.length;
    todos.addEventListener('change', () => { ids.forEach((i) => (todos.checked ? lista.sel.add(i) : lista.sel.delete(i))); re(); });
  }
  app.querySelector('[data-cancelar]')?.addEventListener('click', () => { lista.sel.clear(); re(); });
  app.querySelectorAll('[data-lote]').forEach((b) => b.addEventListener('click', () => {
    const antes = processos.map((p) => ({ ...p })); const n = lista.sel.size;
    processos.forEach((p) => { if (lista.sel.has(p.id)) p.situacao = b.dataset.lote; });
    lista.sel.clear(); salvar(); re();
    avisar(`${n} processo${n > 1 ? 's' : ''} ${b.dataset.lote === 'Arquivado' ? 'arquivado' : 'encaminhado'}${n > 1 ? 's' : ''}.`, () => { processos = antes; salvar(); render(); });
  }));
  app.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () => { lista.aberto = b.dataset.abrir; re(); app.querySelector('#det-t')?.focus(); }));
  app.querySelector('[data-fechar]')?.addEventListener('click', () => { const id = lista.aberto; lista.aberto = null; re(); app.querySelector(`[data-abrir="${id}"]`)?.focus(); });
  app.querySelector('[data-excluir]')?.addEventListener('click', (e) => excluir(e.target.dataset.excluir));
  app.querySelector('[data-exportar]')?.addEventListener('click', exportar);
  if (lista.sel.size) app.querySelector('.lab-batch .lab-btn')?.focus();
}

function excluir(id) {
  const p = processos.find((x) => x.id === id); const dlg = document.getElementById('confirmar');
  dlg.querySelector('#conf-txt').textContent = `O processo ${p.id} (${p.assunto}) sai da lista. Você pode desfazer logo depois.`;
  dlg.onclose = () => {
    if (dlg.returnValue !== 'sim') return;
    const i = processos.indexOf(p); processos.splice(i, 1); lista.aberto = null; lista.sel.delete(id); salvar(); render();
    avisar(`Processo ${p.id} excluído.`, () => { processos.splice(i, 0, p); salvar(); render(); });
  };
  dlg.showModal();
}

function exportar() {
  const linhas = [['Processo', 'Assunto', 'Órgão', 'Interessado', 'Entrada', 'Situação'], ...filtrados().map((p) => [p.id, p.assunto, p.orgao, p.interessado, p.entrada, p.situacao])];
  const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'processos-sigep-poc.csv'; a.click();
}

/* ---------- Cadastro e edição ---------- */
function formulario(id) {
  const p = id ? processos.find((x) => x.id === id) : null;
  if (id && !p) return [`<h1>Processo não encontrado</h1><p><a href="#/processos">Voltar para a lista</a></p>`];
  const v = p || { assunto: '', orgao: '', interessado: '', responsavel: 'Ana Ribeiro', situacao: 'Em análise', descricao: '' };
  const opt = (arr, sel) => arr.map((o) => `<option ${o === sel ? 'selected' : ''}>${o}</option>`).join('');
  const html = `
    <div class="lab-trilha"><a href="#/inicio">Início</a> › <a href="#/processos">Processos</a> › ${p ? 'Editar' : 'Novo processo'}</div>
    <h1>${p ? `Editar processo ${p.id}` : 'Novo processo'}</h1>
    <div class="lab-card">
      <form class="form" novalidate>
        <div class="resumo-erros" hidden tabindex="-1" role="alert"><b>Corrija os campos abaixo:</b><ul style="margin:6px 0 0"></ul></div>
        <label class="lab-field">Assunto *<span class="ajuda">Escolha o tipo de pedido.</span>
          <select class="lab-select" name="assunto" id="c-assunto"><option value="">Selecione</option>${opt(ASSUNTOS, v.assunto)}</select><span class="erro" hidden></span></label>
        <div class="linha">
          <label class="lab-field">Órgão *<select class="lab-select" name="orgao" id="c-orgao"><option value="">Selecione</option>${opt(ORGAOS, v.orgao)}</select><span class="erro" hidden></span></label>
          <label class="lab-field">Situação<select class="lab-select" name="situacao" id="c-situacao">${opt(Object.keys(SITUACOES), v.situacao)}</select></label>
        </div>
        <div class="linha">
          <label class="lab-field">Interessado *<span class="ajuda">Nome completo de quem pediu.</span><input class="lab-input" name="interessado" id="c-interessado" maxlength="80" value="${esc(v.interessado)}"><span class="erro" hidden></span></label>
          <label class="lab-field">Responsável<span class="ajuda">Quem vai cuidar do pedido.</span><select class="lab-select" name="responsavel" id="c-responsavel">${opt(PESSOAS, v.responsavel)}</select></label>
        </div>
        <label class="lab-field">Descrição *<span class="ajuda">O que foi pedido, em poucas linhas. Até 500 caracteres.</span>
          <textarea class="lab-input" name="descricao" id="c-descricao" rows="4" maxlength="500" style="height:auto;padding:8px 12px">${esc(v.descricao)}</textarea><span class="erro" hidden></span></label>
        <div class="acoes"><a class="lab-btn" href="#/processos">Cancelar</a><button class="lab-btn lab-btn--primary" type="submit">${p ? 'Salvar alterações' : 'Cadastrar processo'}</button></div>
      </form>
    </div>`;
  return [html, () => {
    const f = app.querySelector('form');
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      const regras = { assunto: 'Escolha o assunto', orgao: 'Escolha o órgão', interessado: 'Informe o nome do interessado', descricao: 'Descreva o pedido' };
      const erros = Object.entries(regras).filter(([k]) => !String(d[k] || '').trim());
      f.querySelectorAll('.erro').forEach((s) => { s.hidden = true; }); f.querySelectorAll('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
      const resumo = f.querySelector('.resumo-erros');
      if (erros.length) {
        erros.forEach(([k, m]) => { const c = f.querySelector(`#c-${k}`); c.setAttribute('aria-invalid', 'true'); const s = c.parentElement.querySelector('.erro'); s.textContent = m; s.hidden = false; c.setAttribute('aria-describedby', s.id = `e-${k}`); });
        resumo.querySelector('ul').innerHTML = erros.map(([k, m]) => `<li><a href="#c-${k}">${m}</a></li>`).join('');
        resumo.hidden = false; resumo.focus();
        resumo.querySelectorAll('a').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); f.querySelector(a.getAttribute('href')).focus(); }));
        return;
      }
      if (p) { Object.assign(p, d); salvar(); lista.aberto = p.id; manterAberto = true; location.hash = '#/processos'; avisar(`Processo ${p.id} atualizado.`); }
      else {
        const novo = { ...d, id: `2026/${String(1500 + processos.length).padStart(5, '0')}`, entrada: new Date().toLocaleDateString('pt-BR') };
        processos.unshift(novo); salvar(); Object.assign(lista, { busca: '', orgao: '', situacao: '', pagina: 1, ordem: ['entrada', -1] });
        lista.aberto = novo.id; manterAberto = true; location.hash = '#/processos'; avisar(`Processo ${novo.id} cadastrado.`);
      }
    });
  }];
}

render();
