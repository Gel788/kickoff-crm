# Деплой Kickoff

## Локально (SQLite)

```bash
cd apps/web
npm install
npm run db:setup
npm run dev
```

## PostgreSQL (пилот / prod)

```bash
# из корня репозитория
docker compose up -d
```

В `apps/web/.env`:

```env
DATABASE_URL="postgresql://kickoff:kickoff@localhost:5432/kickoff"
```

Измените `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Затем:

```bash
cd apps/web
npx prisma db push
npm run db:seed
npm run build
npm start
```

## Vercel

1. Root directory: `apps/web`
2. Build: `npm run build`
3. Env: `DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`
4. Cron: `vercel.json` — планировщик заявок каждые 2 ч

## PDF (кириллица)

Шрифт: `apps/web/public/fonts/NotoSans-Regular.ttf` — должен быть в репозитории.
