# Kickoff — дизайн-система

## Настроение

**Premium matchday.** Ночной стадион, неон разметки, контраст, уверенность. Не «детский мультик», не «корпоративный серый SaaS».

Референсы по духу: broadcast graphics, UEFA matchday UI, F1 timing screens — **данные крупно, фон тёмный, акцент один яркий**.

---

## Цвета

| Токен | HEX | Использование |
|-------|-----|----------------|
| `--bg-base` | `#06080a` | Фон приложения |
| `--bg-elevated` | `#0e1216` | Карточки, sidebar |
| `--bg-hover` | `#161c22` | Hover строк |
| `--border` | `#1f2830` | Границы |
| `--text` | `#f4f7fa` | Основной текст |
| `--text-muted` | `#8b9aab` | Вторичный |
| `--accent` | `#00e676` | Primary CTA, live, успех |
| `--accent-dim` | `#00e67633` | Glow, badges |
| `--warning` | `#ffb020` | Дедлайны, ожидание |
| `--danger` | `#ff4757` | Карточки, ошибки, live dot |
| `--info` | `#3d8bfd` | Ссылки, инфо |

---

## Типографика

| Роль | Шрифт | Начертание |
|------|-------|------------|
| Display / H1 | **Syne** | 700–800 |
| UI / body | **DM Sans** | 400–600 |
| Mono / счёт, время | **JetBrains Mono** | 500 |

Правила:
- Заголовки страниц — крупно (32–40px), tight tracking
- Счёт матча — mono 48px+
- Минимум 3 уровня иерархии на экране

---

## Компоненты

- **Sidebar** — фиксированный, иконки + label, активный пункт с accent bar слева
- **Stat card** — число mono, label muted, опциональный sparkline
- **Match card** — клубы, время, статус-badge (live пульсирует)
- **Button** — primary (accent fill), ghost, danger
- **Badge** — статусы матча: `live`, `locked`, `review`
- **Data table** — zebra hover, sticky header

---

## Motion

- Переходы 150–200ms ease-out
- Live-индикатор: pulse `danger`
- Появление карточек: лёгкий fade + translateY 8px
- Без лишнего parallax

---

## Layout

- Max width контента: 1440px
- Sidebar: 260px desktop / drawer mobile
- Referee mode: **fullscreen**, кнопки событий min 48px touch

---

## Иконки

Lucide React — stroke 1.5, размер 20/24

---

## Логотип (временно)

Текст **KICKOFF** + точка accent `●` (live). Позже — знак (стилизованная точка разметки / kickoff circle).
