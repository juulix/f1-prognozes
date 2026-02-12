const LV_MONTHS = [
  "janvāris", "februāris", "marts", "aprīlis", "maijs", "jūnijs",
  "jūlijs", "augusts", "septembris", "oktobris", "novembris", "decembris",
];

const LV_WEEKDAYS = [
  "svētdiena", "pirmdiena", "otrdiena", "trešdiena",
  "ceturtdiena", "piektdiena", "sestdiena",
];

const LV_WEEKDAYS_SHORT = ["Sv", "P", "O", "T", "C", "Pk", "S"];

export function formatDateLV(date: Date | string): string {
  const d = new Date(date);
  return `${d.getDate()}. ${LV_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShortLV(date: Date | string): string {
  const d = new Date(date);
  return `${d.getDate()}. ${LV_MONTHS[d.getMonth()].slice(0, 3)}.`;
}

export function formatTimeLV(date: Date | string): string {
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function formatDateTimeLV(date: Date | string): string {
  return `${formatDateLV(date)}, ${formatTimeLV(date)}`;
}

export function getWeekdayLV(date: Date | string): string {
  return LV_WEEKDAYS[new Date(date).getDay()];
}

export function getWeekdayShortLV(date: Date | string): string {
  return LV_WEEKDAYS_SHORT[new Date(date).getDay()];
}

export function isInPast(date: Date | string): boolean {
  return new Date(date) < new Date();
}

export function isInFuture(date: Date | string): boolean {
  return new Date(date) > new Date();
}

export function getTimeUntil(date: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = Math.max(0, new Date(date).getTime() - Date.now());
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}
