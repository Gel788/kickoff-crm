# Разработка офлайн (без сервера)

Сейчас всё крутится **локально на Mac**. Тестовый сервер и прод — позже.

## Минимальный старт

```bash
cd apps/web
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Достаточно двух переменных в `.env`:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="любая-строка-32-символа-минимум-для-jwt"
```

Остальное **не обязательно** до деплоя.

## Что работает без интернета / без облака

| Функция | Локально |
|---------|----------|
| База | SQLite `prisma/dev.db` |
| Auth, все роли | seed `demo123` |
| PDF протокол / заявка | `public/fonts/NotoSans-Regular.ttf` |
| Документы игроков | `public/uploads/` |
| Уведомления | In-app в `/league/notifications` |
| Email | Только лог в терминал (без `RESEND_API_KEY`) |
| Планировщик заявок | При каждом заходе в `/league/*` |
| PWA судьи | `localhost:3000/referee` |

## Демо-логины

Пароль везде: `demo123`

- `operator@kickoff.app` — лига  
- `coach@kickoff.app` — клуб  
- `referee@kickoff.app` — судья  
- `delegate@kickoff.app` — делегат  

## Сброс данных

```bash
cd apps/web
rm -f prisma/dev.db
npm run db:setup
```

## Когда возьмёшь тестовый сервер

Чеклист один раз:

1. [docs/DEPLOY.md](DEPLOY.md) — Postgres или managed DB  
2. `.env` на сервере: `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`  
3. `npx prisma db push && npm run db:seed`  
4. По желанию: `RESEND_API_KEY`, `CRON_SECRET`  

До этого момента **не трогаем** Vercel/Resend — не блокируют разработку.

## Полезные команды

```bash
npm run dev      # разработка
npm run build    # проверка перед коммитом
npm run db:setup # схема + seed
```
