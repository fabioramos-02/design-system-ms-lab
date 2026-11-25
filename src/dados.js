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
