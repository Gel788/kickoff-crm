# Kickoff

**Операционная платформа футбольных лиг** — лицо продукта на лендинге, полный матчдень в приложении.

> **Сейчас:** разработка **офлайн** (SQLite на машине). Тестовый сервер и прод — когда будешь готов → [docs/OFFLINE_DEV.md](docs/OFFLINE_DEV.md) · [docs/DEPLOY.md](docs/DEPLOY.md)

## Запуск (локально)

```bash
cd apps/web
cp .env.example .env   # если нет .env
npm install
npm run db:setup
npm run dev
```

http://localhost:3000 — лендинг  
http://localhost:3000/login — вход

### Демо (пароль `demo123`)

| Email | Роль |
|-------|------|
| operator@kickoff.app | Лига |
| referee@kickoff.app | Судья |
| coach@kickoff.app | Тренер |
| delegate@kickoff.app | Делегат |
| medical@kickoff.app | Врач |
| parent@kickoff.app | Опекун |
| admin@kickoff.app | Platform |

**UAT:** `npm run db:uat` · **E2E:** `npx playwright install && npm run test:e2e`  
**Прогресс:** [docs/TZ_PROGRESS.md](docs/TZ_PROGRESS.md) · [docs/UAT_CHECKLIST.md](docs/UAT_CHECKLIST.md)

## Что реализовано

- Лендинг (hero, live-score, preview, CTA)
- Лига: дашборд, сезоны, регламент, пользователи, отчёты, календарь
- Матч: заявки, авто-окно по дедлайну, перенос, отклонение, PDF заявки и протокола (кириллица)
- Судья: live, замены в/из, PWA
- Email (Resend) + in-app уведомления
- Клуб / делегат / опекун / медицина / дисциплина
- API v1 + OpenAPI, live SSE, API keys, webhooks, rate limit
- Platform `/platform`, multi-tenant `/o/demo`, 2FA, FIFA CSV, Telegram
- S3 storage, PostgreSQL-ready, офлайн-очередь судьи
## Документация

- [Офлайн-разработка](docs/OFFLINE_DEV.md)
- [Деплой (позже)](docs/DEPLOY.md)
- [ТЗ](docs/KICKOFF_SPEC.md)
- [План](docs/DEVELOPMENT_PLAN.md)
- [Дизайн](docs/DESIGN_SYSTEM.md)
