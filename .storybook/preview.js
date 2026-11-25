
// Densidade na barra do Storybook: troca o contexto de qualquer exemplo.
export const globalTypes = {
  densidade: {
    description: 'Densidade da interface',
    toolbar: {
      title: 'Densidade',
      icon: 'component',
      items: [
        { value: 'comfortable', title: 'Confortável (portal do cidadão)' },
        { value: 'default', title: 'Padrão (uso geral)' },
        { value: 'compact', title: 'Compacta (sistemas internos e BI)' },
      ],
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = { densidade: 'default' };

export const decorators = [
  (story, ctx) => {
    const wrap = document.createElement('div');
    wrap.className = 'lab';
    wrap.dataset.density = ctx.parameters.densidadeFixa || ctx.globals.densidade || 'default';
    const out = story();
    if (typeof out === 'string') wrap.innerHTML = out;
    else wrap.appendChild(out);
    return wrap;
  },
];

export const parameters = {
  layout: 'fullscreen',
  options: {
    storySort: {
      order: ['Comece aqui', ['Introdução', 'POCs e apresentação', 'Mapa do que existe', 'Densidade', 'Referências'], 'Padrões', 'Telas'],
    },
  },
};
