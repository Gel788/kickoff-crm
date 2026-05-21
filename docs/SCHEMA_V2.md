# Prisma schema v2 (merge)

**Дата:** 2026-05-21

## Принято из ревью

- `SeasonRegulation` — JSON-регламент + версия (колонки `Season` остаются для UI v1)
- `DisciplinaryCase` — дела/апелляции поверх `DisciplinaryRecord`
- `MedicalClearance` — RTP, сотрясение, связь с `Fixture`
- `Organization` — plan/лимиты/features (без жёсткой тарификации в UI)
- `Player` — `externalFifaId`, `externalFedId`
- `GuardianLink.revokedAt`
- `RefereeProfile.organizationId`
- `WebhookEndpoint` — `events` как `Json` (SQLite-совместимо)
- Доп. индексы

## Сознательно не взято

- **Удаление `SeasonRosterEntry`** — это заявочный лист сезона (R-08), не дубль реестра
- **`Venue` + `venueId`** — позже, пока `Fixture.venue` string
- **`provider = postgresql` в schema** — dev остаётся SQLite; prod — см. `DEPLOY.md`
- **`WebhookEndpoint.events String[]`** — заменено на `Json`

## Синхронизация

При сохранении регламента (`updateSeasonRegulation`) обновляются и колонки `Season`, и `SeasonRegulation.rules`.

Автобан из карточки создаёт и `DisciplinaryRecord`, и `DisciplinaryCase` (AUTO, RESOLVED).
