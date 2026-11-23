# front-end-angular

Interface de estudo para gestão financeira, desenvolvida com Angular.

## Requisitos do trabalho

- Front-end em Angular e back-end em Quarkus.
- Cadastro de contas, categorias e transações.
- Filtros de transações por conta e categoria.
- Transferências entre contas.
- Tela inicial com saldo por conta e saldo geral.
- Autenticação com JWT em cookie HttpOnly.

## Funcionalidades

- Login, restauração de sessão e logout com JWT em cookie HttpOnly.
- Cadastro e consulta de contas e categorias; edição e exclusão de contas.
- Lançamento de receitas/despesas e consulta com filtros por conta e categoria.
- Transferências entre contas.
- Tela inicial com saldo por conta e saldo geral.
- Layout adaptado para computador e celular.

## Como usar

Com Node.js 24.22.1 e npm 12.2.1 instalados:

1. Prepare o `.env` e as chaves no back-end, conforme o README dele. Defina `APP_BOOTSTRAP_EMAIL` e `APP_BOOTSTRAP_SENHA` para criar seu usuário inicial, sem colocar credenciais no Git.
2. Inicie o back-end com `docker compose up --build -d --wait`, na pasta dele.
3. Na pasta do front-end, execute:

```bash
npm ci
npm start
```

Acesse `http://localhost:4200` e entre com o usuário criado no back-end. O `npm start` usa `proxy.conf.json` para encaminhar `/api` ao Quarkus em `http://localhost:8080`. Não é necessário mudar URLs nas telas.

O JWT permanece no cookie HttpOnly. O token CSRF vem de `/api/auth/csrf` e é enviado no cabeçalho `X-XSRF-TOKEN`; ele fica apenas em memória. Uma sessão expirada leva ao login.

Em Contas, use Editar para carregar o nome no formulário e Salvar para atualizar. Excluir pede confirmação; contas com lançamentos não podem ser excluídas, preservando o histórico financeiro. A mensagem da API é exibida na tela.

Para parar o front-end, use Ctrl+C no terminal. Para desligar API e banco, execute `docker compose down` na pasta do back-end; os dados ficam no volume.

## Testes e build

```bash
npm test -- --watch=false
npm run build
```

Os testes cobrem autenticação, CSRF, sessão, navegação protegida, cadastros, filtros e valores monetários. O build fica em `dist/aula1/browser`. Para publicar, sirva esses arquivos com um proxy `/api` para o Quarkus e configure HTTPS e cookies seguros no back-end.

## Back-end

[back-end-quarkus](https://github.com/fernando-bastian/back-end-quarkus)

O [guia de apresentação](https://github.com/fernando-bastian/back-end-quarkus/blob/main/docs/guia-apresentacao.md) explica o projeto completo, os arquivos principais, o fluxo entre interface, API e banco, e inclui um roteiro de demonstração.
