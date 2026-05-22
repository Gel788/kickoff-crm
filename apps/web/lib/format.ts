import {
  format as dfFormat,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";
import { ru } from "date-fns/locale";

const locale = ru;

export const format = {
  date(d: Date) {
    return dfFormat(d, "d MMMM yyyy", { locale });
  },
  time(d: Date) {
    return dfFormat(d, "HH:mm", { locale });
  },
  datetime(d: Date) {
    return `${format.date(d)} · ${format.time(d)}`;
  },
  shortDate(d: Date) {
    return dfFormat(d, "d MMM", { locale });
  },
  relative(d: Date) {
    if (isToday(d)) return `сегодня, ${format.time(d)}`;
    if (isTomorrow(d)) return `завтра, ${format.time(d)}`;
    if (isYesterday(d)) return `вчера, ${format.time(d)}`;
    return formatDistanceToNow(d, { addSuffix: true, locale });
  },
};
