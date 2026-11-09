# AutoStock Analytics

**Sistema autoral de demonstração para concessionárias**, desenvolvido por Marcos Feitosa. Inclui um portal de clientes com catálogo visual e um portal administrativo com gestão de estoque, compras, vendas e indicadores de Business Intelligence.

> Este projeto é independente e foi desenvolvido para estudo e portfólio. Nenhum código da aplicação de terceiros foi reutilizado. Fotos ilustrativas geradas para a interface. Valores do modo demonstração são **fictícios**.

## Ambientes

| Portal | Página | Funcionalidades |
|---|---|---|
| Início / acesso | `index.html` | Apresentação, acesso por perfil, login e cadastro de clientes |
| Clientes | `cliente.html` | Fotos e catálogo de carros disponíveis, busca, filtros, preços, solicitações e acompanhamento |
| Administrador | `admin.html` | Dashboard BI, indicadores, gráficos, fotos, estoque, compras, vendas, relatórios CSV, controle de solicitações |

## Demonstração (sem credenciais)

1. Abra `index.html` no navegador ou em GitHub Pages.
2. Clique **Explorar demonstração do cliente** ou **Explorar demonstração administrativa**.
3. No portal do cliente, teste filtros e **Tenho interesse**. Depois volte ao portal inicial, entre na demonstração administrativa e visualize a solicitação. Alterações de estoque feitas no administrador demonstrativo aparecem na vitrine do cliente **no mesmo navegador** (reabra ou atualize a página); veículos vendidos e reservados não são oferecidos no catálogo.
4. Na área administrativa, teste o cadastro, edição, importação/exportação CSV e atualização das solicitações.

**Atenção:** modo demonstração **não é autenticação**. A seleção de perfis é feita por `sessionStorage`; os veículos e pedidos de demonstração ficam no `localStorage` do próprio navegador. É apenas para aprendizado e testes, não para dados reais ou segurança de usuários.

## Login real com e-mail e senha (Supabase)

O frontend tem integração preparada para [Supabase Auth](https://supabase.com/docs/guides/auth) e PostgreSQL, com políticas de segurança em nível de linha (*RLS*). Para habilitar:

1. Crie um projeto no Supabase. Em **Authentication → Providers**, configure o acesso por e-mail. No painel **Authentication → URL Configuration**, inclua a URL do seu site em `Redirect URLs` e defina a URL principal.
2. Abra **SQL Editor** no Supabase e execute `supabase/schema.sql`. Isso cria `profiles`, `vehicles`, `pedidos`, uma visão pública restrita `catalogo_veiculos`, políticas RLS e a função para finalizar pedidos de forma atômica.
3. No arquivo `assets/config.js`, preencha `supabaseUrl` e `supabaseAnonKey` com a **URL do projeto** e a chave **anon/publishable**. Esta chave pública é destinada a uso no navegador; **nunca** use a `service_role` ou qualquer segredo de banco no JavaScript/GitHub.
4. Na página inicial, clique **Entrar como cliente → Criar conta de cliente**. Dependendo das opções do Auth, confirme o e-mail enviado.
5. Para criar o administrador, primeiro cadastre-o pelo Supabase Authentication ou pelo formulário de cadastro de cliente, e então **promova esse usuário manualmente** com o comando ao final de `supabase/schema.sql`, executado no SQL Editor:

   ```sql
   update public.profiles set role='admin'
   where id=(select id from auth.users where email='email-do-admin@dominio.com');
   ```

6. Entre em **Portal do Administrador** usando o e-mail e a senha desse usuário. Apenas `role='admin'` pode ler e alterar estoque e custos. Clientes cadastrados têm acesso ao catálogo de veículos disponíveis **sem custo de aquisição**, além das próprias solicitações.
7. Cadastre veículos pela área administrativa; o catálogo dos clientes passa a exibi-los automaticamente quando estiverem como **Disponível**.

**Não existem contas ou senhas padrão**. O cadastro público cria somente `cliente`. Se o Supabase não for configurado, o formulário de login real informa que está indisponível, mas a demonstração continua funcionando.

### Como funcionam as solicitações

- Cliente autenticado solicita atendimento para um veículo disponível. Isso cria um pedido `Pendente`; **não é pagamento nem compra efetivada**.
- Administrador consulta as solicitações, pode cancelar ou confirmar uma venda após a negociação.
- Ao **Concluir venda**, a função `autostock_concluir_pedido` atualiza **pedido e veículo na mesma transação**. Se o veículo já não estiver disponível, a operação falha sem registrar a venda.
- Custos de aquisição são consultados somente pelo administrador, conforme políticas RLS; o catálogo de clientes não contém custos.

### Limitações do MVP

- Não há cobrança online, integração de pagamentos, nota fiscal ou sincronização offline.
- O campo de fotos aceita URL HTTPS. Fotos padrão ilustrativas estão incluídas no projeto.
- Importação CSV para Supabase acrescenta ou atualiza veículos (não apaga automaticamente o estoque existente).
- O sistema exige internet para autenticação real; a demonstração estática não exige instalação de servidor.
- Antes de usar em produção, adicionar verificação de dados de cadastro, auditoria, antifraude/limites de requisição, armazenamento próprio de fotos, backup e revisão de políticas, incluindo testes integrados em um Supabase de homologação.

## Executar localmente

1. Abra a pasta no VS Code.
2. Inicie um servidor estático, por exemplo:

   ```bash
   python -m http.server 8080
   ```

3. Acesse `http://localhost:8080/`. Para habilitar GitHub Pages, abra **Settings → Pages → Deploy from branch → main / (root)**.

## Testes

É necessário Node.js 18+:

```bash
npm test
```

O workflow em `.github/workflows/test.yml` executa os testes no GitHub Actions. Os testes locais verificam regras de negócio e integridade básica dos portais; não substituem testes integrados do serviço Supabase real.

## Estrutura

```text
index.html                    # Portal inicial e login
cliente.html                  # Área de clientes
admin.html                    # Dashboard e painel de gestão
assets/
  config.js                   # Chaves públicas do Supabase (preencher pelo proprietário)
  auth.js                     # Verificação de sessões e perfis
  portal.js / portal.css      # Acesso e página inicial
  client.js / client.css      # Vitrine e solicitações de clientes
  app.js / styles.css         # Gestão e indicadores administrativos
  admin-requests.js          # Tratamento das solicitações pelo administrador
  admin-extra.css            # Fotos e extensões do painel
  core.js                     # Validações e lógica BI
  photos/                     # Fotos ilustrativas geradas para este projeto
supabase/schema.sql          # Banco de dados, funções e RLS
sample data: data/veiculos-exemplo.csv
tests/                       # Testes automatizados
```

**Autor:** Marcos Feitosa · [GitHub](https://github.com/MarcosFeitosa0408) · [Portfólio](https://marcosfeitosa-dev.com.br/)
