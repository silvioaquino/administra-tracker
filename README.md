# Central de Acompanhamento e Qualidade — Administra.ai

Painel interno para acompanhar o desenvolvimento, os testes e a qualidade do SaaS **Administra.ai**, baseado no cronograma de 90 dias / 11 sprints da equipe.

## Stack

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **TailwindCSS 4** + **shadcn/ui** (base-nova)
- **Prisma 5** + **NeonDB** (PostgreSQL)
- **NextAuth** (credentials, JWT) — proteção via `proxy.ts`
- **Recharts** (gráficos)

## Funcionalidades

- **Dashboard** — indicadores gerais, % de testes passando, bugs abertos/críticos, progresso do checklist, gráfico de progresso por sprint e distribuição por tipo de teste.
- **Sprints & Testes** — 11 sprints, 188 testes; troca de status ao vivo (Pendente / Executando / Passou / Falhou).
- **Bugs** — 37 bugs com filtro por prioridade e edição de prioridade/status.
- **Melhorias** — backlog de melhorias com status.
- **Checklist** — checklist de produção por categoria, com progresso.

## Equipe (papéis)

| Handle | Papel | Conta seed |
| --- | --- | --- |
| `@dev` | Desenvolvimento (Silvio) | silvio.aquinodev@gmail.com |
| `@seguranca` | Segurança | seguranca@administra.ai |
| `@usabilidade` | Usabilidade / QA | usabilidade@administra.ai |

Senha padrão do seed: `admin123` (definida em `SEED_PASSWORD`).

## Como rodar

```bash
npm install

# 1. Configure a DATABASE_URL do Neon no .env
# 2. Aplique o schema e popule a base
npm run db:push
npm run db:seed

# 3. Desenvolvimento
npm run dev
```

Abra http://localhost:3000 e faça login com uma das contas acima.

## Deploy na Vercel

1. Suba o repositório para o GitHub (ou use o Vercel CLI — veja abaixo).
2. Em **Project Settings → Environment Variables**, configure (Production + Preview):
   - `DATABASE_URL` — connection string do Neon (use o host `-pooler`)
   - `NEXTAUTH_URL` — URL pública do deploy (ex: `https://seu-app.vercel.app`)
   - `NEXTAUTH_SECRET` — segredo forte (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
   - `SEED_PASSWORD` — (opcional) senha das contas do seed
3. O build roda `prisma generate && next build` automaticamente; `postinstall` também gera o client.
4. Se o banco de produção for novo, popule uma vez com `npm run db:push && npm run db:seed` (apontando o `.env` local para o banco de produção).

### Via Vercel CLI

```bash
# Faça login (interativo — rode no seu terminal):
vercel login

# Na pasta do projeto:
vercel link          # vincula/cria o projeto
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel --prod        # deploy de produção
```

> As funções rodam na região `iad1` (us-east-1), mesma do Neon, para menor latência (ver `vercel.json`).

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run start` | Build e execução de produção |
| `npm run db:push` | Sincroniza o schema com o banco |
| `npm run db:seed` | Popula a base a partir do cronograma |
| `npm run db:studio` | Prisma Studio |

## Estrutura

```
src/
├─ app/
│  ├─ (app)/            # rotas protegidas (dashboard, sprints, bugs, melhorias, checklist)
│  ├─ api/              # route handlers (auth + mutações PATCH)
│  └─ login/            # tela de login
├─ components/          # layout, dashboard, sprints, bugs, improvements, checklist, ui (shadcn)
├─ lib/                 # prisma, auth, data (acesso resiliente), labels, utils
└─ proxy.ts             # proteção de rotas (NextAuth)
prisma/
├─ schema.prisma        # User, Sprint, Test, Bug, Improvement, ChecklistItem, Metric
└─ seed.ts              # dados do cronograma (KAIUP)
```
