import { tabelaProcessos } from '../../shared/ui.js';
import { processos } from '../../shared/dados.js';

export default { title: 'Comece aqui/Densidade', parameters: { layout: 'padded' } };

const bloco = (d, nome, quem) => `
  <section class="lab" data-density="${d}" style="padding:0;margin-bottom:24px">
    <h2 style="display:flex;justify-content:space-between;margin-bottom:8px">${nome}<span class="muted" style="font-size:13px;font-weight:400">${quem}</span></h2>
    <div style="display:flex;gap:8px;margin-bottom:8px"><input class="lab-input" placeholder="Buscar" aria-label="Buscar (${nome})"><button class="lab-btn lab-btn--primary">Filtrar</button></div>
    ${tabelaProcessos({ caption: `Densidade ${nome.toLowerCase()}`, linhas: processos.slice(0, 3) })}
  </section>`;

export const TresDensidades = {
  name: 'As três densidades',
  render: () => `<div>${bloco('comfortable', 'Confortável', 'Portal do cidadão')}${bloco('default', 'Padrão', 'Uso geral')}${bloco('compact', 'Compacta', 'Sistemas internos e BI')}</div>`,
};
