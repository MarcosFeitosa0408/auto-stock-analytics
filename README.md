# AutoStock Analytics — Gestão Inteligente de Estoque de Veículos

Aplicação web demonstrativa desenvolvida como **projeto autoral de estudo e portfólio** com foco em gestão comercial, qualidade de dados e Business Intelligence.

## Recursos disponíveis (MVP)

- Dashboard responsivo com indicadores de estoque, capital investido, receita e lucro bruto.
- Gráfico de vendas por mês e distribuição de veículos por situação.
- Cadastro, edição e exclusão de veículos (marca, modelo, categoria, ano, preços e status).
- Pesquisa e filtros por marca e situação.
- Importação e exportação de arquivos CSV com validação de registros e IDs únicos.
- Persistência no `localStorage` do navegador; dados iniciais inteiramente fictícios.
- Testes automatizados das regras de negócio (`node --test`).

## Como executar

1. Abra [`index.html`](index.html) em um navegador moderno, sem instalar pacotes.
2. Para testes, instale o Node.js (18+) e execute `npm test` no terminal.
3. Para disponibilizar online, configure **Settings → Pages → Deploy from a branch → main / (root)** no GitHub. A publicação precisa ser ativada pelo proprietário do repositório.

O projeto funciona **sem servidor e sem banco de dados externo**. O cadastro é salvo somente no navegador em que a aplicação é usada. A aplicação é um MVP front-end; não possui autenticação, sincronização entre dispositivos ou API de produção.

## Estrutura

```text
.
├── index.html             # Dashboard e interface
├── assets/
│   ├── styles.css         # Identidade visual responsiva
│   ├── core.js            # Indicadores, validação e CSV
│   └── app.js             # Interações, CRUD e armazenamento
├── data/
│   └── veiculos-exemplo.csv
├── tests/
│   └── core.test.js
├── .github/workflows/
│   └── test.yml           # Testes em cada push
└── package.json
```

## Indicadores: regras de cálculo

- **Capital em estoque:** soma dos custos de veículos disponíveis e reservados.
- **Receita realizada:** soma dos preços dos veículos vendidos.
- **Lucro bruto realizado:** receita realizada menos custo de aquisição dos veículos vendidos. **Não** representa lucro líquido (não inclui impostos, comissões ou outras despesas).
- **Ticket médio:** receita realizada dividida pelo número de veículos vendidos.
- **Margem bruta:** lucro bruto dividido pela receita realizada.
- **Potencial de vendas:** soma dos preços dos veículos ainda não vendidos.

Os valores de demonstração são fictícios e não devem ser apresentados como resultados de uma empresa real.

## Referência e autoria

O tema foi inspirado pela análise do repositório público [gestao-estoque-veiculos, de marinizedev](https://github.com/marinizedev/gestao-estoque-veiculos). **Este repositório é uma implementação independente**, com outra arquitetura, código próprio e indicadores de BI. Nenhum arquivo de código ou imagem do projeto original foi copiado. O ZIP recebido foi utilizado apenas para estudo e referência, pois o repositório de origem não indicava uma licença de redistribuição.

**Autor deste projeto:** Marcos Feitosa — [portfólio](https://marcosfeitosa-dev.com.br/) | [GitHub](https://github.com/MarcosFeitosa0408).

## Próximas evoluções

API com Java/Spring Boot e banco de dados PostgreSQL, autenticação, histórico de operações, validação de CSV por lote, relatórios de rentabilidade e integração com Power BI.
