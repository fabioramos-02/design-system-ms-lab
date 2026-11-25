// Cada padrão vira uma seção em "Padrões". Docs nas 5 perguntas.
import { cinco } from '../cinco.js';
import { el, toolbar, tabelaProcessos, ligarOrdenacao, ligarSelecao, barraLote, ligarDetalhe, painelDetalhe,
  conteiner, linhas, barrasH, tabelaSimples } from '../../shared/ui.js';
import { meses, atendimentosPorMes, porOrgao } from '../../shared/dados.js';

export default {
  title: 'Padrões/Sistemas internos e BI',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component:
    'Padrões que o Design System MS ainda não tem para sistemas internos e painéis de BI. Troque a **Densidade** na barra de cima para ver cada um nas três medidas.' } } },
};

const doc = (o) => ({ docs: { description: { story: cinco(o) } } });

export const Toolbar = {
  name: 'Toolbar e filtros aplicados',
  render: () => { const r = el(`<div>${toolbar()}${tabelaProcessos()}</div>`); ligarOrdenacao(r); return r; },
  parameters: doc({
    oque: 'A barra acima da tabela com busca, filtros e as ações da lista inteira. Os filtros aplicados aparecem como chips logo abaixo.',
    quando: 'Em toda lista operacional com mais de uma página de registros, ou quando a pessoa precisa achar um item por critério.',
    naoQuando: 'Em lista curta (menos de 10 itens) ou só de leitura no portal do cidadão. Ali basta a tabela.',
    como: 'Ordem fixa: busca → filtros → espaço → até 2 ações (a principal à direita) → contagem. Mais ações vão para um menu. Cada filtro aplicado vira um chip com "×", e "Limpar filtros" fica no fim. Entre filtros diferentes vale **E**; dentro do mesmo filtro, **OU**.',
    a11y: '`role="toolbar"` com nome; todo campo com rótulo (mesmo que visualmente oculto); o "×" do chip diz o que remove ("Remover filtro Situação: em aberto").',
    fontes: '[PatternFly — Toolbar](https://www.patternfly.org/components/toolbar/design-guidelines), [PatternFly — Filtros](https://www.patternfly.org/patterns/filters/design-guidelines), [Carbon — Data table](https://carbondesignsystem.com/components/data-table/usage/).',
  }),
};

export const AcoesEmLote = {
  name: 'Ações em lote',
  render: () => {
    const r = el(`<div>${toolbar({ chips: false })}${barraLote()}${tabelaProcessos({ select: true })}</div>`);
    ligarOrdenacao(r); ligarSelecao(r); return r;
  },
  parameters: doc({
    oque: 'Marcar vários registros e aplicar a mesma ação a todos (encaminhar, atribuir, arquivar). Marque uma linha para ver a barra.',
    quando: 'Quando o trabalho do dia repete a mesma ação em muitos itens, como distribuir processos ou arquivar concluídos.',
    naoQuando: 'Quando a ação depende de olhar cada item (um despacho, por exemplo) ou é irreversível sem confirmação item a item.',
    como: 'Checkbox por linha e um no cabeçalho com 3 estados (nenhum, parcial, todos da página). Com 1 item marcado, a barra azul aparece no lugar da toolbar com "N selecionados", as ações e "Cancelar". Enquanto há seleção, as ações de linha ficam desligadas para não haver dúvida sobre o alcance.',
    a11y: 'Cada checkbox tem rótulo próprio ("Selecionar Concessão de diárias, processo 2026/01482"); o do cabeçalho diz que pega a **página**; a linha marcada recebe `aria-selected`.',
    fontes: '[Carbon — Batch actions](https://carbondesignsystem.com/components/data-table/usage/), [PatternFly — Bulk selection](https://www.patternfly.org/patterns/bulk-selection), [MOJ — Multi select](https://design-patterns.service.justice.gov.uk/components/multi-select/).',
  }),
};

export const MasterDetail = {
  name: 'Master-detail (lista + detalhe)',
  render: () => {
    const r = el(`<div>${toolbar({ chips: false })}<div class="lab-md"><div>${tabelaProcessos()}</div>${painelDetalhe()}</div></div>`);
    ligarOrdenacao(r); const abrir = ligarDetalhe(r); setTimeout(() => abrir('2026/01477'), 0); return r;
  },
  parameters: doc({
    oque: 'A lista e o detalhe do item aberto na mesma tela. A pessoa consulta e edita em sequência, sem perder o lugar na lista.',
    quando: 'Para ir e voltar numa fila de trabalho: ler o processo, despachar e abrir o próximo.',
    naoQuando: 'Para tarefa longa ou com várias etapas (use uma página própria) e para confirmar uma decisão crítica (use um diálogo).',
    como: 'Clique no assunto (link claro na 1ª coluna, nunca "Ver"). O painel ocupa cerca de 1/3 da tela com o `ds-drawer` do DS; o item aberto fica destacado. No celular, abre um painel por vez.',
    a11y: 'Ao abrir, o foco vai para o título do painel; o botão de fechar tem nome; a linha aberta recebe `aria-current`.',
    fontes: '[PatternFly — Primary-detail](https://www.patternfly.org/patterns/primary-detail/design-guidelines), [MOJ — Lista de casos](https://design-patterns.service.justice.gov.uk/pages/case-list/).',
  }),
};

export const BarraDeFiltros = {
  name: 'Barra de filtros do painel',
  render: () => `
    <form class="lab-filterbar" aria-label="Filtros do painel" onsubmit="return false">
      <label class="lab-field">Período<select class="lab-select"><option>Últimos 6 meses</option><option>2026</option></select></label>
      <label class="lab-field">Órgão<select class="lab-select"><option>Todos os órgãos</option><option>DETRAN</option><option>SEFAZ</option></select></label>
      <label class="lab-field">Canal<select class="lab-select"><option>Digital e presencial</option><option>Só digital</option></select></label>
      <button class="lab-btn lab-btn--primary">Aplicar</button>
      <button class="lab-btn lab-btn--ghost" type="reset">Limpar</button>
    </form>`,
  parameters: doc({
    oque: 'Os filtros que valem para o painel inteiro: período, órgão, canal.',
    quando: 'Em todo painel com mais de um recorte. Fica no topo, antes dos indicadores.',
    naoQuando: 'Para filtrar um gráfico só (o filtro vai no próprio gráfico) ou em painel de um número só.',
    como: 'Campos com rótulo visível, no máximo 4 ou 5. "Aplicar" atualiza todos os indicadores e gráficos juntos, e o recorte escolhido aparece no subtítulo de cada gráfico.',
    a11y: 'É um `<form>` com nome; cada campo com `<label>`; o resultado da filtragem é anunciado (região `aria-live`).',
    fontes: '[Carbon — Dashboards](https://carbondesignsystem.com/data-visualization/dashboards/), [MOJ — Filtrar lista](https://design-patterns.service.justice.gov.uk/patterns/filter-a-list/).',
  }),
};

export const ConteinerDeGrafico = {
  name: 'Contêiner de gráfico com metadados',
  render: () => `<div style="max-width:640px">${conteiner({
    titulo: 'O atendimento digital cresceu 72% em seis meses',
    sub: 'Atendimentos por mês, todos os órgãos, jun. a nov. de 2026',
    svg: linhas(atendimentosPorMes, meses),
    tabela: tabelaSimples(['Mês', 'Digital', 'Presencial'], meses.map((m, i) => [m, atendimentosPorMes.Digital[i], atendimentosPorMes.Presencial[i]]), 'Atendimentos por mês'),
    fonte: '<a href="#">Painel de Atendimento — base consolidada</a>', atualizado: '25/11/2026, 08:30', metodo: 'soma dos atendimentos concluídos no mês',
  })}</div>`,
  parameters: doc({
    oque: 'A moldura padrão de todo gráfico: título que diz o achado, subtítulo com o recorte, o gráfico, "ver como tabela" e o rodapé com fonte, data de atualização e método.',
    quando: 'Em todo gráfico de painel ou relatório, inclusive com o `ds-chart` do DS oficial dentro.',
    naoQuando: 'Num número isolado (use o KPI) ou numa ilustração que não mostra dado.',
    como: 'Título com a mensagem ("cresceu 72% em seis meses"), não o nome da métrica. Subtítulo com dado, recorte e período. Rótulo direto na série em vez de legenda. Eixo de barras começa em zero. Rodapé sempre com Fonte, Atualizado em e Método.',
    a11y: 'É um `<figure>`; o desenho fica `aria-hidden` e a informação está no título e na tabela de "Ver como tabela". As séries se distinguem por cor **e** traço (contínuo × tracejado) e têm rótulo.',
    fontes: '[Analysis Function (UK)](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/), [USWDS — Data visualizations](https://designsystem.digital.gov/components/data-visualizations/), [Carbon — Chart anatomy](https://carbondesignsystem.com/data-visualization/chart-anatomy/), [W3C — Imagens complexas](https://www.w3.org/WAI/tutorials/images/complex/).',
  }),
};

export const PaletaDeDados = {
  name: 'Paleta de dados',
  render: () => `
    <div style="display:grid;gap:16px;max-width:760px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<div style="border:1px solid var(--ds-color-border);border-radius:8px;overflow:hidden">
          <div style="height:44px;background:var(--lab-data-${i})"></div><div style="padding:6px 8px;font-size:12px"><b>Série ${i}</b><br><code>--lab-data-${i}</code></div></div>`).join('')}
      </div>
      <div class="lab-chart" style="max-width:640px"><div class="body">${barrasH(porOrgao)}</div></div>
    </div>`,
  parameters: doc({
    oque: 'As cores para séries e categorias de gráfico, tiradas das cores do DS e numa ordem fixa. É separada das cores de **situação** (sucesso, alerta, erro).',
    quando: 'Sempre que um gráfico tem mais de uma série ou categoria. Use na ordem: série 1, série 2…',
    naoQuando: 'Para indicar situação (use as cores de status) ou com mais de 6 ou 7 categorias (agrupe em "Outros"). Um gráfico de uma série só usa a cor 1.',
    como: 'Variáveis `--lab-data-1` a `--lab-data-8`. A mesma categoria tem a mesma cor em todo o painel. Evite vermelho ao lado de verde.',
    a11y: 'Cor nunca é o único meio: rótulo direto, traço ou textura. Contraste de pelo menos 3:1 com o fundo para barras e linhas (WCAG 1.4.11). *A conferir com a X-VIA: contraste de cada cor.*',
    fontes: '[Carbon — Paletas](https://carbondesignsystem.com/data-visualization/color-palettes/), [PatternFly — Cores de gráfico](https://www.patternfly.org/components/charts/colors-for-charts/design-guidelines), [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).',
  }),
};
