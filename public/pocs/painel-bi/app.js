// Painel de Atendimentos — POC de painel de BI feito com o Design System MS (dados fictícios).
import { moldura, conteiner, linhas, tabelaSimples } from '../../shared/ui.js';
import { gerarAtendimentos, MESES_BI } from '../../shared/dados.js';

const DADOS = gerarAtendimentos();
const ORGAOS = [...new Set(DADOS.map((d) => d.orgao))];
const f = { periodo: 6, orgao: '', canal: 'todos', ordem: ['total', -1] };
const app = document.getElementById('app');
const n = (v) => v.toLocaleString('pt-BR');
const pct = (v) => `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

function recorte() {
  const meses = MESES_BI.slice(-f.periodo);
  return DADOS.filter((d) => meses.includes(d.mes) && (!f.orgao || d.orgao === f.orgao));
}
const tot = (d) => (f.canal === 'digital' ? d.digital : f.canal === 'presencial' ? d.presencial : d.digital + d.presencial);
const soma = (arr, fn) => arr.reduce((s, d) => s + fn(d), 0);

function render() {
  const dados = recorte();
  const meses = MESES_BI.slice(-f.periodo);
  const ult = meses.at(-1), ant = meses.at(-2);
  const doMes = (m) => dados.filter((d) => d.mes === m);
  const tUlt = soma(doMes(ult), tot), tAnt = soma(doMes(ant), tot);
  const dig = (m) => soma(doMes(m), (d) => d.digital) / soma(doMes(m), (d) => d.digital + d.presencial);
  const media = (m, k) => soma(doMes(m), (d) => d[k] * (d.digital + d.presencial)) / soma(doMes(m), (d) => d.digital + d.presencial);
  const recorteTxt = `${f.orgao || 'todos os órgãos'}${f.canal !== 'todos' ? `, canal ${f.canal}` : ''}`;

  const series = {};
  if (f.canal !== 'presencial') series.Digital = meses.map((m) => soma(doMes(m), (d) => d.digital));
  if (f.canal !== 'digital') series.Presencial = meses.map((m) => soma(doMes(m), (d) => d.presencial));
  const sDig = series.Digital;
  const cresc = sDig ? sDig.at(-1) / sDig[0] - 1 : null;

  // Barras por órgão no último mês (sempre todos os órgãos, para o drill-down).
  const porOrgao = ORGAOS.map((o) => [o, soma(DADOS.filter((d) => d.orgao === o && d.mes === ult), tot)]).sort((a, b) => b[1] - a[1]);
  const totalOrg = soma(porOrgao, (x) => x[1]);
  const max = porOrgao[0][1];
  const barras = `<svg viewBox="0 0 520 ${porOrgao.length * 34 + 10}" class="barra-clicavel" aria-hidden="true">
    ${porOrgao.map(([o, v], i) => { const y = 6 + i * 34, w = (380 * v) / max, sel = !f.orgao || f.orgao === o;
      return `<text x="72" y="${y + 17}" text-anchor="end">${o}</text>
      <rect data-org="${o}" x="80" y="${y + 4}" width="${w}" height="20" rx="3" fill="var(--lab-data-1)" opacity="${sel ? 1 : 0.3}"></rect>
      <text x="${86 + w}" y="${y + 18}">${n(v)}</text>`; }).join('')}
  </svg>`;

  // Tabela analítica por órgão.
  const linhasT = ORGAOS.map((o) => {
    const u = DADOS.filter((d) => d.orgao === o && d.mes === ult)[0], a = DADOS.filter((d) => d.orgao === o && d.mes === ant)[0];
    const total = tot(u); return { o, total, var: total / tot(a) - 1, dig: u.digital / (u.digital + u.presencial), dias: u.dias, nota: u.nota };
  });
  const [k, dir] = f.ordem; linhasT.sort((a, b) => (k === 'o' ? a.o.localeCompare(b.o) : a[k] - b[k]) * dir);
  const th = (key, rot, num = true) => `<th scope="col"${num ? ' class="num"' : ''} aria-sort="${k === key ? (dir > 0 ? 'ascending' : 'descending') : 'none'}"><button class="sort" data-ordem="${key}">${rot}</button></th>`;

  const kpi = (label, value, delta, sobe, bom, meta) => `<div class="lab-kpi"><span class="label">${label}</span><span class="value">${value}</span>
    <span class="delta--${bom ? 'up' : 'down'}">${sobe ? '▲' : '▼'} ${delta} <span class="muted">vs. ${ant}</span></span><span class="meta">${meta}</span></div>`;
  const dDias = media(ult, 'dias') - media(ant, 'dias'), dNota = media(ult, 'nota') - media(ant, 'nota');
  const um = (v, d = 1) => Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: d });

  const conteudo = `
    <div class="cabeca">
      <div><div class="lab-trilha">Painéis › Atendimento ao cidadão</div><h1>Atendimentos ao cidadão</h1><p class="muted" style="margin:4px 0 0">${recorteTxt} · ${meses[0]} a ${ult} de 2026</p></div>
      <div class="densidade" role="group" aria-label="Densidade"><button aria-pressed="${app.dataset.density === 'default'}" data-dens="default">Padrão</button><button aria-pressed="${app.dataset.density === 'compact'}" data-dens="compact">Compacta</button></div>
    </div>
    <form class="lab-filterbar" aria-label="Filtros do painel" onsubmit="return false">
      <label class="lab-field">Período<select class="lab-select" id="f-per"><option value="6" ${f.periodo === 6 ? 'selected' : ''}>Últimos 6 meses</option><option value="3" ${f.periodo === 3 ? 'selected' : ''}>Últimos 3 meses</option></select></label>
      <label class="lab-field">Órgão<select class="lab-select" id="f-org"><option value="">Todos os órgãos</option>${ORGAOS.map((o) => `<option ${o === f.orgao ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
      <label class="lab-field">Canal<select class="lab-select" id="f-can"><option value="todos">Digital e presencial</option><option value="digital" ${f.canal === 'digital' ? 'selected' : ''}>Só digital</option><option value="presencial" ${f.canal === 'presencial' ? 'selected' : ''}>Só presencial</option></select></label>
      ${f.orgao || f.canal !== 'todos' || f.periodo !== 6 ? '<button class="lab-btn lab-btn--ghost" type="button" data-limpar>Limpar filtros</button>' : ''}
    </form>
    ${f.orgao ? `<div class="lab-chips" aria-label="Filtros aplicados"><span class="lab-chip">Órgão: ${f.orgao} <button data-tirar aria-label="Remover filtro Órgão: ${f.orgao}">×</button></span></div>` : ''}
    <section class="lab-grid lab-grid--kpis" aria-label="Indicadores de ${ult}">
      ${kpi(`Atendimentos em ${ult}`, n(tUlt), pct(Math.abs(tUlt / tAnt - 1)), tUlt >= tAnt, tUlt >= tAnt, `${recorteTxt}`)}
      ${kpi('Feitos no digital', pct(dig(ult)), `${um((dig(ult) - dig(ant)) * 100)} p.p.`, dig(ult) >= dig(ant), dig(ult) >= dig(ant), 'Meta 2026: 70%')}
      ${kpi('Tempo médio', `${um(media(ult, 'dias'))} dias`, `${um(dDias)} dia`, dDias > 0, dDias <= 0, 'Do pedido à conclusão')}
      ${kpi('Avaliação média', `${um(media(ult, 'nota'))} de 5`, um(dNota), dNota >= 0, dNota >= 0, 'Avaliação de Serviços')}
    </section>
    <section class="lab-grid lab-grid--2">
      ${conteiner({
        titulo: cresc !== null ? `O atendimento digital ${cresc >= 0 ? 'cresceu' : 'caiu'} ${pct(Math.abs(cresc))} no período` : 'Atendimento presencial no período',
        sub: `Atendimentos por mês e canal, ${recorteTxt}`, svg: linhas(series, meses),
        tabela: tabelaSimples(['Mês', ...Object.keys(series)], meses.map((m, i) => [m, ...Object.values(series).map((s) => s[i])]), 'Atendimentos por mês'),
        fonte: 'Painel de Atendimento (dados fictícios)', atualizado: '25/11/2026, 08:30', metodo: 'atendimentos concluídos no mês' })}
      ${conteiner({
        titulo: `${porOrgao[0][0]} concentra ${pct(porOrgao[0][1] / totalOrg)} dos atendimentos`,
        sub: `Atendimentos em ${ult} por órgão. <span class="dica">Clique numa barra para filtrar o painel.</span>`, svg: barras,
        tabela: tabelaSimples(['Órgão', 'Atendimentos'], porOrgao, 'Atendimentos por órgão'),
        fonte: 'Painel de Atendimento (dados fictícios)', atualizado: '25/11/2026, 08:30' })}
    </section>
    <section class="lab-card" aria-labelledby="t-tab">
      <h2 id="t-tab" style="margin-bottom:8px">Comparativo por órgão em ${ult}</h2>
      <div class="lab-table-wrap"><table class="lab-table"><caption class="sr-only">Comparativo por órgão</caption>
        <thead><tr>${th('o', 'Órgão', false)}${th('total', 'Atendimentos')}${th('var', `Variação vs. ${ant}`)}${th('dig', 'Digital')}${th('dias', 'Tempo médio (dias)')}${th('nota', 'Avaliação')}</tr></thead>
        <tbody>${linhasT.map((l) => `<tr${f.orgao === l.o ? ' aria-selected="true"' : ''}><th scope="row">${l.o}</th><td class="num">${n(l.total)}</td>
          <td class="num"><span class="delta--${l.var >= 0 ? 'up' : 'down'}" style="color:var(--ds-color-status-${l.var >= 0 ? 'success' : 'error'}-fg)">${l.var >= 0 ? '▲' : '▼'} ${pct(Math.abs(l.var))}</span></td>
          <td class="num">${pct(l.dig)}</td><td class="num">${um(l.dias)}</td><td class="num">${um(l.nota)}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="dica" style="margin:8px 0 0">Fonte: Painel de Atendimento (dados fictícios) · Atualizado em 25/11/2026, 08:30</p>
    </section>`;

  app.innerHTML = moldura({ base: '../../', sistema: 'Painel de Atendimentos', orgao: 'SETDIG', usuario: 'Fabio Ramos', conteudo });
  ligar();
}

function ligar() {
  const anunciar = (t) => { document.getElementById('anuncio').textContent = t; };
  const set = (k, v) => { f[k] = v; render(); anunciar('Painel atualizado.'); };
  app.querySelector('#f-per').addEventListener('change', (e) => set('periodo', +e.target.value));
  app.querySelector('#f-org').addEventListener('change', (e) => set('orgao', e.target.value));
  app.querySelector('#f-can').addEventListener('change', (e) => set('canal', e.target.value));
  app.querySelector('[data-limpar]')?.addEventListener('click', () => { Object.assign(f, { periodo: 6, orgao: '', canal: 'todos' }); render(); anunciar('Filtros limpos.'); });
  app.querySelector('[data-tirar]')?.addEventListener('click', () => set('orgao', ''));
  app.querySelectorAll('[data-org]').forEach((r) => r.addEventListener('click', () => set('orgao', f.orgao === r.dataset.org ? '' : r.dataset.org)));
  app.querySelectorAll('[data-ordem]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.ordem; f.ordem = [k, f.ordem[0] === k ? -f.ordem[1] : -1]; render(); }));
  app.querySelectorAll('[data-dens]').forEach((b) => b.addEventListener('click', () => { app.dataset.density = b.dataset.dens; render(); }));
}

render();
