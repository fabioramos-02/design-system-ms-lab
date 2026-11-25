# Design System MS — laboratório para sistemas internos e painéis de BI

Proposta da **SETDIG** (Superintendência de Governo Digital) para evoluir o
[Design System MS](https://designsystem.digital.ms.gov.br) a três contextos de uso: portal do cidadão, sistemas
internos e painéis de BI. **Não é um Design System novo:** usa a mesma identidade, os mesmos tokens e as mesmas regras de
acessibilidade. O que for validado aqui vai para a X-VIA incorporar ao oficial.

## O que tem

- **Comece aqui:** os três contextos, o mapa do que já existe no DS oficial × o que falta, a densidade
  (confortável, padrão, compacta) e as referências (Carbon, PatternFly, gov.br, USWDS, MOJ, W3C).
- **Padrões:** toolbar e filtros, ações em lote, master-detail, barra de filtros, contêiner de gráfico com metadados e
  paleta de dados. Cada um responde às 5 perguntas: o que é, quando usar, quando não usar, como implementar e
  acessibilidade.
- **Telas:** uma fila de processos de sistema interno e um painel de BI, montados com os padrões.

Os dados dos exemplos são fictícios.

## Como rodar

```bash
npm install
npm run storybook        # http://localhost:6007
npm run build-storybook  # gera storybook-static/
```

O push na `main` publica no GitHub Pages (`.github/workflows/pages.yml`).

## Tokens

`tokens/ds-tokens.css` é cópia dos tokens públicos do Storybook oficial, com a data no cabeçalho. Não edite à mão:
copie de novo quando o oficial mudar. O que é novo leva o prefixo `--lab-` / `.lab-`, para ficar claro que ainda é
proposta.

## Relação com outros projetos

- **DS oficial** (`@plataforma-xvia/ds-*`, X-VIA): a fonte. O lab só propõe variações e o que falta.
- `storybook-ds-ms` e `DS-MS-Design-System`: Storybooks anteriores do DS para sites. Este lab não os substitui.
