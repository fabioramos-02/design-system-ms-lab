// Telas reais montadas com os padrões. Abrem na densidade compacta.
import { el, toolbar, tabelaProcessos, ligarOrdenacao, ligarSelecao, barraLote, ligarDetalhe, painelDetalhe,
  conteiner, linhas, barrasH, tabelaSimples, moldura } from '../../shared/ui.js';
import { meses, atendimentosPorMes, porOrgao } from '../../shared/dados.js';

export default { title: 'Telas/Exemplos', parameters: { layout: 'fullscreen', densidadeFixa: 'compact' } };

export const SistemaInterno = {
  name: 'Sistema interno — fila de processos',
  render: () => {
    const r = el(moldura({
      sistema: 'Gestão de Processos',
      menu: [['Fila de processos', '#', true], ['Meus despachos', '#'], ['Relatórios', '#'], ['Configurações', '#']],
      conteudo: `<h1>Fila de processos</h1>${toolbar()}${barraLote()}
        <div class="lab-md"><div>${tabelaProcessos({ select: true, caption: 'Processos em aberto na SEGOV' })}</div>${painelDetalhe()}</div>`,
    }));
    ligarOrdenacao(r); ligarSelecao(r); ligarDetalhe(r); return r;
  },
};

// sobe: a seta; bom: a cor (tempo que cai é bom).
const kpi = (label, value, delta, sobe, bom, meta) => `
  <div class="lab-kpi"><span class="label">${label}</span><span class="value">${value}</span>
  <span class="delta--${bom ? 'up' : 'down'}">${sobe ? '▲' : '▼'} ${delta} <span class="muted">vs. outubro</span></span><span class="meta">${meta}</span></div>`;

export const PainelBI = {
  name: 'Painel de BI — atendimentos',
  render: () => `
    <div style="display:grid;gap:16px;max-width:1280px;margin:0 auto">
      <div><h1>Atendimentos ao cidadão</h1><p class="muted" style="margin:4px 0 0">Todos os órgãos · últimos 6 meses</p></div>
      <form class="lab-filterbar" aria-label="Filtros do painel" onsubmit="return false">
        <label class="lab-field">Período<select class="lab-select"><option>Últimos 6 meses</option></select></label>
        <label class="lab-field">Órgão<select class="lab-select"><option>Todos os órgãos</option></select></label>
        <label class="lab-field">Canal<select class="lab-select"><option>Digital e presencial</option></select></label>
        <button class="lab-btn lab-btn--primary">Aplicar</button>
      </form>
      <section class="lab-grid lab-grid--kpis" aria-label="Indicadores">
        ${kpi('Atendimentos em nov.', '18.600', '4,5%', true, true, 'Fonte: Painel de Atendimento')}
        ${kpi('Feitos no digital', '75,8%', '3,3 p.p.', true, true, 'Meta 2026: 70%')}
        ${kpi('Tempo médio', '2,4 dias', '0,6 dia', false, true, 'Do pedido à conclusão')}
        ${kpi('Avaliação média', '4,3 de 5', '0,1', false, false, '2.310 avaliações')}
      </section>
      <section class="lab-grid lab-grid--2">
        ${conteiner({ titulo: 'O atendimento digital cresceu 72% em seis meses', sub: 'Atendimentos por mês e canal, jun. a nov. de 2026', svg: linhas(atendimentosPorMes, meses),
          tabela: tabelaSimples(['Mês', 'Digital', 'Presencial'], meses.map((m, i) => [m, atendimentosPorMes.Digital[i], atendimentosPorMes.Presencial[i]]), 'Atendimentos por mês'),
          fonte: 'Painel de Atendimento', atualizado: '25/11/2026, 08:30', metodo: 'atendimentos concluídos' })}
        ${conteiner({ titulo: 'DETRAN concentra 35% dos atendimentos', sub: 'Atendimentos em novembro por órgão', svg: barrasH(porOrgao),
          tabela: tabelaSimples(['Órgão', 'Atendimentos'], porOrgao, 'Atendimentos por órgão'),
          fonte: 'Painel de Atendimento', atualizado: '25/11/2026, 08:30' })}
      </section>
    </div>`,
};
