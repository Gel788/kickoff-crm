import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ClipboardList,
  FileCheck,
  Lock,
  Radio,
  type LucideIcon,
} from "lucide-react";

export type JourneyStep = {
  id: string;
  title: string;
  subtitle: string;
  who: string;
  icon: LucideIcon;
  color: string;
};

const DEFAULT_STEPS: JourneyStep[] = [
  {
    id: "squad",
    title: "Заявка",
    subtitle: "Клуб подаёт состав. Лига видит допуск и документы.",
    who: "Клуб → Лига",
    icon: ClipboardList,
    color: "text-info",
  },
  {
    id: "lock",
    title: "Lock",
    subtitle: "Дедлайн прошёл — составы заморожены. Сюрпризов на поле нет.",
    who: "Система",
    icon: Lock,
    color: "text-warning",
  },
  {
    id: "live",
    title: "Live",
    subtitle: "Судья фиксирует голы и карточки. Счёт и таблица обновляются сами.",
    who: "Судья",
    icon: Radio,
    color: "text-danger",
  },
  {
    id: "review",
    title: "Проверка",
    subtitle: "Делегаты подписывают. Лига проверяет протокол.",
    who: "Клуб + Лига",
    icon: FileCheck,
    color: "text-muted",
  },
  {
    id: "closed",
    title: "Закрыт",
    subtitle: "PDF для федерации. Турнирная таблица и бомбардиры — готовы.",
    who: "Лига",
    icon: CheckCircle2,
    color: "text-accent",
  },
];

export function MatchdayJourney({
  steps = DEFAULT_STEPS,
  compact = false,
}: {
  steps?: JourneyStep[];
  compact?: boolean;
}) {
  return (
    <div className={cn("relative", compact ? "py-4" : "py-8")}>
      <div
        className={cn(
          "grid gap-4",
          compact
            ? "grid-cols-2 md:grid-cols-5"
            : "md:grid-cols-5",
        )}
      >
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative">
              {i < steps.length - 1 && (
                <div
                  className="absolute right-0 top-8 z-0 hidden h-px w-[calc(50%+1rem)] translate-x-1/2 bg-gradient-to-r from-border via-accent/40 to-border md:block"
                  aria-hidden
                />
              )}
              <div className="relative z-10 rounded-2xl border border-border bg-elevated/90 p-4 transition-colors hover:border-accent/30">
                <div
                  className={cn(
                    "mb-3 inline-flex rounded-xl bg-base/80 p-2.5",
                    step.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {step.who}
                </p>
                <h4 className="mt-1 font-display text-base font-bold">{step.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted">{step.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
