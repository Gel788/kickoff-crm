import { AlertPanel } from "@/components/kickoff/ui";

const MESSAGES: Record<string, string> = {
  has_fixtures: "Нельзя удалить: есть матчи в календаре. Сначала удалите матчи.",
  in_squad: "Нельзя удалить игрока: он в заявке на матч.",
  fixture_started: "Нельзя удалить матч: он уже начался или заявки закрыты.",
  roster_limit: "Лимит заявочного листа сезона исчерпан.",
  self: "Нельзя удалить свою учётную запись.",
  saved: "Сохранено.",
  same_club: "Хозяева и гости не могут быть одним клубом.",
  need_clubs: "Для генерации тура нужно минимум 2 клуба в сезоне.",
  duplicate_exact:
    "Игрок с таким ФИО и датой рождения уже есть в реестре.",
  squad_limit: "Достигнут лимит игроков в клубе на сезон.",
};

const SUCCESS: Record<string, string> = {
  invited: "Пользователь приглашён. Пароль по умолчанию: demo123",
  reset_sent: "Если email найден, ссылка для сброса отправлена (в dev — смотрите консоль сервера).",
  reset_ok: "Пароль обновлён. Войдите с новым паролем.",
  "2fa_on": "Двухфакторная аутентификация включена.",
  "2fa_off": "2FA отключена.",
  match_created: "Матч добавлен в календарь.",
  round_created: "Тур создан — можно добавлять матчи.",
  tour_generated: "Сгенерированы все пары тура.",
};

export function FlashBanner({
  code,
  flash,
  warn,
  hint,
}: {
  code?: string;
  flash?: string;
  warn?: string;
  hint?: string;
}) {
  if (warn === "similar" && hint) {
    return (
      <div className="mb-6">
        <AlertPanel variant="warning" title="Похожий игрок в реестре">
          <p className="mb-2">{decodeURIComponent(hint)}</p>
          <p className="text-sm text-muted">
            Если это другой человек — отметьте подтверждение и создайте снова.
          </p>
        </AlertPanel>
      </div>
    );
  }
  if (flash && SUCCESS[flash]) {
    return (
      <div className="mb-6">
        <AlertPanel variant="info" title="Готово">
          <p>{SUCCESS[flash]}</p>
        </AlertPanel>
      </div>
    );
  }
  if (!code || !MESSAGES[code]) return null;
  return (
    <div className="mb-6">
      <AlertPanel variant="warning" title="Внимание">
        <p>{MESSAGES[code]}</p>
      </AlertPanel>
    </div>
  );
}
