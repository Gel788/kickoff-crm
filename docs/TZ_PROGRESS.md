# Прогресс по KICKOFF_SPEC

Обновлено: 2026-05-21

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
npm run db:setup
npm run db:uat    # опционально: +12 матчей UAT
npm run dev
```

**Аккаунты:** `operator@kickoff.app`, `admin@kickoff.app`, `referee@kickoff.app`, `coach@kickoff.app`, `parent@kickoff.app` — пароль `demo123`
