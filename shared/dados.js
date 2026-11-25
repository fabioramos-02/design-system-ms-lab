// Dados fictícios para os exemplos.
export const processos = [
  { id: '2026/01482', assunto: 'Concessão de diárias', orgao: 'SEGOV', responsavel: 'Ana Ribeiro', entrada: '18/11/2026', dias: 7, status: ['Em análise', 'info'] },
  { id: '2026/01477', assunto: 'Licença para capacitação', orgao: 'SAD', responsavel: 'Bruno Costa', entrada: '17/11/2026', dias: 8, status: ['Pendente de documento', 'warning'] },
  { id: '2026/01470', assunto: 'Ressarcimento de despesa', orgao: 'SEFAZ', responsavel: 'Carla Mendes', entrada: '14/11/2026', dias: 11, status: ['Atrasado', 'error'] },
  { id: '2026/01466', assunto: 'Progressão funcional', orgao: 'SED', responsavel: 'Diego Alves', entrada: '13/11/2026', dias: 12, status: ['Em análise', 'info'] },
  { id: '2026/01459', assunto: 'Cessão de servidor', orgao: 'SES', responsavel: 'Elisa Prado', entrada: '11/11/2026', dias: 14, status: ['Concluído', 'success'] },
  { id: '2026/01451', assunto: 'Auxílio-transporte', orgao: 'SEJUSP', responsavel: 'Fábio Nunes', entrada: '10/11/2026', dias: 15, status: ['Concluído', 'success'] },
  { id: '2026/01448', assunto: 'Férias — alteração de período', orgao: 'DETRAN', responsavel: 'Gisele Rocha', entrada: '07/11/2026', dias: 18, status: ['Pendente de documento', 'warning'] },
  { id: '2026/01440', assunto: 'Concessão de diárias', orgao: 'IAGRO', responsavel: 'Hugo Lima', entrada: '05/11/2026', dias: 20, status: ['Arquivado', 'neutral'] },
];

export const meses = ['jun', 'jul', 'ago', 'set', 'out', 'nov'];
export const atendimentosPorMes = { Digital: [8200, 9100, 10400, 11800, 12900, 14100], Presencial: [6100, 5900, 5600, 5200, 4900, 4500] };
export const porOrgao = [
  ['DETRAN', 6510], ['SEFAZ', 4020], ['SED', 2870], ['SES', 2560], ['SEJUSP', 1790], ['IAGRO', 850],
];

// Base maior para as POCs: 26 processos fictícios.
const ASSUNTOS = ['Concessão de diárias', 'Licença para capacitação', 'Ressarcimento de despesa', 'Progressão funcional',
  'Cessão de servidor', 'Auxílio-transporte', 'Férias — alteração de período', 'Abono de permanência', 'Adicional de insalubridade',
  'Averbação de tempo de serviço', 'Licença-prêmio', 'Remoção a pedido', 'Horário especial de estudante'];
const ORGAOS = ['SEGOV', 'SAD', 'SEFAZ', 'SED', 'SES', 'SEJUSP', 'DETRAN', 'IAGRO', 'IMASUL'];
const PESSOAS = ['Ana Ribeiro', 'Bruno Costa', 'Carla Mendes', 'Diego Alves', 'Elisa Prado', 'Fábio Nunes', 'Gisele Rocha', 'Hugo Lima', 'Íris Campos'];
export const SITUACOES = { 'Em análise': 'info', 'Pendente de documento': 'warning', 'Atrasado': 'error', 'Concluído': 'success', 'Arquivado': 'neutral' };
export function gerarProcessos() {
  const sit = Object.keys(SITUACOES);
  return Array.from({ length: 26 }, (_, i) => {
    const dia = 24 - (i % 24), mes = i < 24 ? 11 : 10;
    return {
      id: `2026/${String(1490 - i * 3).padStart(5, '0')}`,
      assunto: ASSUNTOS[(i * 5) % ASSUNTOS.length], orgao: ORGAOS[(i * 7) % ORGAOS.length],
      interessado: PESSOAS[(i * 4 + 1) % PESSOAS.length], responsavel: PESSOAS[i % PESSOAS.length],
      entrada: `${String(dia).padStart(2, '0')}/${mes}/2026`, situacao: sit[(i * 3) % sit.length],
      descricao: 'Pedido registrado para os exemplos do laboratório. Dados fictícios.',
    };
  });
}
export { ORGAOS, PESSOAS, ASSUNTOS };

// Painel de BI: atendimentos por órgão, mês e canal (fictícios, mas coerentes entre si).
export const MESES_BI = ['jun', 'jul', 'ago', 'set', 'out', 'nov'];
const BASE = { DETRAN: 6000, SEFAZ: 3800, SED: 2700, SES: 2500, SEJUSP: 1800, IAGRO: 900 };
const DIGITAL_INICIO = { DETRAN: 0.62, SEFAZ: 0.7, SED: 0.5, SES: 0.45, SEJUSP: 0.4, IAGRO: 0.55 };
export function gerarAtendimentos() {
  const linhas = [];
  Object.entries(BASE).forEach(([orgao, base], k) => MESES_BI.forEach((mes, i) => {
    const total = Math.round(base * (0.9 + i * 0.03 + ((k + i) % 3) * 0.01));
    const pd = Math.min(0.9, DIGITAL_INICIO[orgao] + i * 0.035);
    const digital = Math.round(total * pd);
    linhas.push({ orgao, mes, i, digital, presencial: total - digital, dias: +(3.4 - i * 0.18 + k * 0.1).toFixed(1), nota: +(4.0 + i * 0.05 - k * 0.04).toFixed(1) });
  }));
  return linhas;
}
