import { Logo } from "@/components/kickoff/logo";
import {
  Calendar,
  FileCheck,
  Radio,
  TableProperties,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Calendar,
    title: "Календарь и заявки",
    desc: "Drag-календарь, дедлайны, WhatsApp-текст для клуба",
  },
  {
    icon: Radio,
    title: "Live-табло",
    desc: "SSE на стадион и сайт лиги без ручного обновления",
  },
  {
    icon: FileCheck,
    title: "Протокол PDF",
    desc: "Судья с поля → лига проверяет → таблица пересчитывается",
  },
  {
    icon: TableProperties,
    title: "Публичная лига",
    desc: "Таблица, бомбардиры, embed и OG для соцсетей",
  },
];

export function LoginShowcase() {
  return (
    <div className="relative flex flex-col justify-between p-8 lg:p-14">
      <div>
        <Logo />
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.35em] text-accent">
          Matchday OS
        </p>
        <h2 className="mt-4 max-w-lg font-display text-4xl font-extrabold leading-[1.05] tracking-tight lg:text-5xl">
          Операционная
          <br />
          <span className="bg-gradient-to-r from-accent to-emerald-200 bg-clip-text text-transparent">
            система лиги
          </span>
        </h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
          Не таблица в Excel и чаты в мессенджере — один контур от заявки до
          официального протокола и live-счёта.
        </p>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="login-feature-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
            >
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-3 text-sm font-semibold">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="login-showcase-stats mt-10 flex flex-wrap gap-6 border-t border-white/[0.06] pt-8">
        <div>
          <p className="font-display text-2xl font-bold text-accent">18+</p>
          <p className="text-xs text-muted">матчей в демо</p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold">Live</p>
          <p className="text-xs text-muted">протокол с поля</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />
          <div>
            <p className="text-sm font-medium">10 мин</p>
            <p className="text-xs text-muted">полный матчдень</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-info" />
          <div>
            <p className="text-sm font-medium">5 ролей</p>
            <p className="text-xs text-muted">лига · клуб · судья</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link
          href="/o/demo"
          className="font-medium text-accent hover:text-white"
        >
          Публичная лига →
        </Link>
        <Link
          href="/live/demo"
          className="text-muted hover:text-white"
        >
          Live-табло →
        </Link>
      </div>
    </div>
  );
}
