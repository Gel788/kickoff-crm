export const format = {
  date(d: Date) {
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  },
  time(d: Date) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  },
  datetime(d: Date) {
    return `${format.date(d)} · ${format.time(d)}`;
  },
};
