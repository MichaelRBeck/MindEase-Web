# MindEase (Web) --- Acessibilidade Cognitiva

Plataforma web do **MindEase**, criada para melhorar a experiência
digital de pessoas com desafios cognitivos (TDAH, TEA, dislexia,
burnout, ansiedade digital e sobrecarga mental), com foco em
**previsibilidade, redução de estímulos e personalização da
complexidade**.

------------------------------------------------------------------------

# ✨ Features (MVP do Hackathon)

## 1) Painel Cognitivo Personalizável

-   Ajuste de **complexidade da interface**
    -   simple
    -   medium
    -   detailed
-   **Modo Foco** (reduz distrações e UI secundária)
-   **Resumo vs Detalhado** (progressive disclosure)
-   Ajustes de:
    -   contraste
    -   espaçamento
    -   tamanho de fonte
-   **Alertas cognitivos**
    -   ex: "você está há muito tempo nesta tarefa"

------------------------------------------------------------------------

## 2) Organizador de Tarefas com Suporte Cognitivo

-   **Kanban simplificado**
-   **Drag & Drop funcional**
-   **Checklist inteligente**
-   **Transição suave entre atividades**
-   **Pomodoro adaptado e gentil**

Características do timer:

-   start
-   pause
-   resume
-   sem urgência agressiva
-   sem estímulos visuais fortes

------------------------------------------------------------------------

## 3) Perfil + Preferências Persistentes

-   Perfil do usuário
-   Preferências de acessibilidade persistidas

Exemplos:

-   modo foco
-   contraste
-   espaçamento
-   reduce motion
-   densidade de interface

As preferências são restauradas automaticamente ao recarregar a
aplicação.

------------------------------------------------------------------------

# 🧱 Arquitetura & Estrutura

## Stack

-   Next.js (App Router)
-   React
-   TypeScript (strict mode)
-   Styled-components com SSR
-   Firebase (Auth + Firestore)
-   Firebase Admin (server)
-   Jest + Testing Library
-   jest-axe (acessibilidade)
-   Playwright ou Cypress (E2E)
-   GitHub Actions (CI/CD)

------------------------------------------------------------------------

## Estrutura do Projeto

    src

    app/
      (app)/
        dashboard/
        panel/
        profile/
        settings/
        tasks/
        timer/

      api/
        session/

      auth/
      onboarding/

      lib/
        auth/
        firebase/
        ssr/

    features/

      auth/
      cognitive/
      dashboard/
      landing/
      navigation/
      onboarding/
      profile/
      settings/
      tasks/
      timer/
      transitions/

    store/

    tests/
      components/
      features/
      test-utils/

------------------------------------------------------------------------

# 🚀 Como rodar localmente

## Pré-requisitos

-   Node.js 18+
-   Projeto Firebase configurado

------------------------------------------------------------------------

## Instalar dependências

``` bash
npm install
```

ou

``` bash
yarn
```

ou

``` bash
pnpm install
```

------------------------------------------------------------------------

## Variáveis de ambiente

Crie um arquivo:

    .env.local

Adicione:

``` env
# Client (Public)

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server (Admin)

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### Observação importante

A chave privada do Firebase Admin possui quebras de linha.

Ela deve ser armazenada assim:

``` env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

------------------------------------------------------------------------

## Rodar o projeto

``` bash
npm run dev
```

Acesse:

    http://localhost:3000

------------------------------------------------------------------------

# 🧪 Testes

``` bash
npm test
```

ou

``` bash
npm run test:watch
```

------------------------------------------------------------------------

# 🧰 Scripts

  Script      Descrição
  ----------- -----------------------
  dev         inicia ambiente local
  build       build de produção
  start       roda build
  lint        ESLint
  typecheck   tsc --noEmit
  test        Jest
  e2e         testes end-to-end

------------------------------------------------------------------------

# 📦 Deploy

Compatível com:

-   Vercel
-   Firebase Hosting
-   qualquer ambiente Node.js

------------------------------------------------------------------------

# 🎯 Objetivo do Projeto

O **MindEase** busca reduzir fricção cognitiva em ferramentas digitais
através de:

-   interfaces previsíveis
-   controle de complexidade
-   redução de estímulos
-   foco em tarefas essenciais
