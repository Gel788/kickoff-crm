# Kickoff — план разработки

**Обновлено:** 2026-05-21  
**Статус:** MVP v1 + пилот ~98% + платформа ~72% ТЗ  
**Режим:** SQLite локально; Postgres/Resend/S3/Telegram — **готовы к env**, см. `.env.example`

---

## Спринты

### Спринт 0 — Старт ✅
- [x] Monorepo, Next.js, дизайн-система
- [x] Лендинг (hero, live-score, preview, marquee, CTA)
- [x] Логин, shell лиги
- [x] README, `.env.example`

### Спринт 1 — Фундамент ✅
- [x] Prisma schema (SQLite dev)
- [x] Auth (JWT cookie session)
- [x] Middleware защиты маршрутов
- [x] Seed с демо-лигой (+ делегат, врач, опекун)

### Спринт 2 — Реестр ✅
- [x] Клубы, игроки, допуск
- [x] Создание клуба/игрока/документов

### Спринт 3 — Календарь + заявки ✅
- [x] Календарь, статусы, настройки (регламент, туры, round-robin)
- [x] Заявка: draft → submit → approve → lock
- [x] Кабинет клуба + делегат (подпись)

### Спринт 4 — Протокол LIVE ✅
- [x] Экран судьи
- [x] PWA service worker (`/sw.js`)
- [x] Медицина, споры, подписи на матче

### Спринт 5 — Закрытие + таблица ✅
- [x] Close match → standings, scorers
- [x] Дисциплина (автобаны)
- [x] PDF протокол (`/api/fixtures/[id]/protocol`)
- [x] Печать HTML, публичный API v1

### Спринт 6 — Пилот (почти готово)
- [x] PDF кириллица (Noto Sans)
- [x] PDF заявки на матч
- [x] Авто-открытие/lock заявок (`lib/scheduler.ts` + cron)
- [x] Email (Resend) + in-app
- [x] Загрузка документов (local)
- [x] Замены судья (вышел/вошёл)
- [x] CI + docker-compose Postgres + DEPLOY.md (на будущее)
- [ ] **Отложено:** тестовый сервер + PostgreSQL
- [x] CRUD клубы/игроки/матчи/пользователи/соревнования
- [x] Live `/live/[slug]`, API keys, webhooks, platform `/platform`
- [x] Сброс пароля, офлайн-очередь судьи, DisciplinaryCase UI
- [x] Schema v2 merge (SeasonRosterEntry сохранён)
- [ ] UAT 10+ матчей ([PILOT_IDEAL.md](PILOT_IDEAL.md))
- [x] E2E Playwright (`npm run test:e2e`)
- [x] Таблица: очки из регламента, дивизион, карточки, дашборд, дубликаты игроков
- [ ] **Отложено:** тестовый сервер + PostgreSQL
- [ ] Telegram

---

## Идеал пилота

Чеклист: [docs/PILOT_IDEAL.md](PILOT_IDEAL.md) (~96% офлайн) · [docs/TZ_PROGRESS.md](TZ_PROGRESS.md)

---

## Запуск

```bash
cd apps/web
npm run db:setup
npm run dev
```

**Демо:** `operator@kickoff.app` / `demo123`

---

## Структура

```text
apps/web/
  prisma/              # schema + seed
  lib/                 # auth, actions*, discipline, standings
  app/                 # league, club, referee, guardian, landing
  components/
    kickoff/           # UI kit
    landing/           # лендинг
    fixture/           # медицина, споры
```
