# Прогресс по KICKOFF_SPEC

Обновлено: 2026-05-22

## Сводка

| Область | Готовность |
|---------|------------|
| **Пилот офлайн** | **~98%** |
| **Фаза 1 MVP** | **~85%** |
| **Фаза 1b** | **~70%** |
| **Фаза 2** | **~65%** |
| **Platform / SaaS** | **~55%** |
| **Весь документ** | **~72%** |

## Реализовано

### Пилот и матчдень
- Полный цикл матча, CRUD, дисциплина, PDF+брендинг
- UAT-скрипт: `npm run db:uat`
- E2E: `e2e/smoke.spec.ts`, `e2e/match-flow.spec.ts`

### Интеграции и API
- REST: standings, fixtures, fixture detail, squads, players, scorers, live
- OpenAPI: `/api/openapi`
- Rate limit на публичном API
- API keys + webhooks
- Live SSE: `/api/v1/{slug}/live/stream`

### Прод-готовность
- PostgreSQL: `docker-compose.yml` + `.env.example`
- Resend email
- S3 storage abstraction (`lib/storage.ts`)
- Telegram bot webhook + org chat

### Платформа
- `/platform` — org, планы pilot/pro/enterprise
- `/o/{slug}` — публичный хаб лиги
- `/o/{slug}/league/*` — multi-tenant rewrite
- 2FA TOTP: `/settings/account`
- FIFA: externalFifaId, CSV export

### Порталы
- Опекун: согласие, ближайшие матчи
- Дашборд: споры, документы, алерты

## Осталось

| Задача | Тип |
|--------|-----|
| UAT 10+ матчей вручную | Операционно |
| Деплой Vercel/VPS + Postgres prod | DevOps |
| Stripe billing UI | Фаза 3 |
| FIFA Connect API (не только CSV) | Фаза 3 |
| SAML SSO | Фаза 4 |
| Нативные apps | Фаза 4 |

### Интеграция OpenLeague / sunday-league (2026-05-22)

- Календарь: месячный вид, iCal/CSV, публичный `/api/v1/{slug}/calendar.ics`, RSVP
- Горячие клавиши лиги (`league-keyboard-shortcuts`)
- WhatsApp-текст заявки + копирование (`/club`, карточка матча)
- Дубликаты игроков через **fuse.js**
- Статистика игрока, `/league/leaderboard`, графики на `/league/reports` (recharts)
- QR на матче (протокол + live по slug org)
- Embed таблицы: `/embed/{slug}/standings`, сниппет в отчётах
- Кубок: `/league/cup` (сетка топ-8 из таблицы, без отдельной сетки в БД)

### Волна 3 — open libs (2026-05-22)

- **Форма** (W/D/L) в турнирной таблице
- **Очные встречи** `/league/compare` (H2H)
- **Балансировщик** `/league/tools` (snake draft, sunday-league)
- **⌘K палитра** — fuse.js по страницам и клубам
- **Embed бомбардиров** `/embed/{slug}/scorers`
- **Спарклайн голов** на карточке игрока (recharts)
- **Ссылка на матч** + переход в H2H с карточки матча

### Лендинг + публичная лига (2026-05-22)

- Главная `/`: живые данные демо-лиги, сетка «Open source → Kickoff», embed-превью, Before/After, ValueSplit
- Публичный хаб `/o/demo`: таблица с формой, бомбардиры, iCal, live, API

### Волна 4 — «всё из open libs» (2026-05-22)

- **FullCalendar** — `/league/calendar?view=fc`, drag-and-drop → `rescheduleFixture`
- **@tanstack/react-table** — игроки, лидерборд (сортировка, поиск)
- **date-fns** — `lib/format.ts` (относительные даты)
- **cmdk** + fuse — ⌘K палитра
- **vaul** — мобильный drawer матчей в кабинете клуба
- **@tanstack/react-query** — live-табло + кабинет лиги
- **OG-картинка** — `/o/{slug}/opengraph-image` (next/og)
- **HTML-письма** — `lib/emails/templates.ts`, Resend в notify + дедлайн заявок
- **Magic link** — `/login` + `/api/auth/magic`
- **lenis** — плавный скролл лендинга
- **Кубок** — горизонтальная сетка QF → SF → финал

**Отложено:** отдельные матчи кубка в БД, `next-intl`, Stripe, BullMQ, Radix UI kit.

### Закрыто в MVP-дожиме (2026-05-21)

- Очки таблицы из `SeasonRegulation.rules` (победа/ничья/поражение)
- Фильтр таблицы по дивизиону + API `?division=`
- Статистика карточек на странице таблицы
- Дашборд: мини-таблица
- Дубликаты игроков: предупреждение + подтверждение
- Переоткрытие матча: причина в аудите

## Запуск

```bash
cd "/Users/albertgiloan/Desktop/Footbol crm /apps/web"
npm run db:setup   # сид + демо-статистика (голы, таблица, графики)
# если экраны пустые после старого сида:
npm run db:demo    # +18 закрытых матчей с событиями, без сброса аккаунтов
npm run db:uat     # опционально: +12 матчей UAT
npm run dev
```

**Аккаунты:** `operator@kickoff.app`, `admin@kickoff.app`, `referee@kickoff.app`, `coach@kickoff.app`, `parent@kickoff.app` — пароль `demo123`
