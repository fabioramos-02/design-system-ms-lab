// Monta a página de docs nas 5 perguntas de todo componente.
export const cinco = ({ oque, quando, naoQuando, como, a11y, fontes }) => `
**O que é?** ${oque}

**Quando usar?** ${quando}

**Quando não usar?** ${naoQuando}

**Como implementar?** ${como}

**Acessibilidade.** ${a11y}

${fontes ? `*Referências:* ${fontes}` : ''}`;
