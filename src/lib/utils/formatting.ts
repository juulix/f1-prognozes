export function pluralize(count: number, one: string, few: string, many: string): string {
  if (count % 10 === 1 && count % 100 !== 11) return `${count} ${one}`;
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return `${count} ${few}`;
  return `${count} ${many}`;
}

export function ordinalLV(n: number): string {
  return `${n}.`;
}

export function pointsDisplay(points: number): string {
  if (points > 0) return `+${points}`;
  return `${points}`;
}
