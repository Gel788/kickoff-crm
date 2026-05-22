/** Балансировка команд (snake draft) — идея из sunday-league / pickup apps. */
export type BalancerPlayer = {
  id: string;
  name: string;
  skill: number;
};

export function balanceTeams(players: BalancerPlayer[]): {
  teamA: BalancerPlayer[];
  teamB: BalancerPlayer[];
  totalA: number;
  totalB: number;
} {
  const sorted = [...players].sort((a, b) => b.skill - a.skill);
  const teamA: BalancerPlayer[] = [];
  const teamB: BalancerPlayer[] = [];

  sorted.forEach((p, i) => {
    const round = Math.floor(i / 2);
    const pickA = round % 2 === 0 ? i % 2 === 0 : i % 2 === 1;
    if (pickA) teamA.push(p);
    else teamB.push(p);
  });

  const sum = (arr: BalancerPlayer[]) =>
    arr.reduce((s, p) => s + p.skill, 0);

  return {
    teamA,
    teamB,
    totalA: sum(teamA),
    totalB: sum(teamB),
  };
}

export function parseBalancerLines(text: string): BalancerPlayer[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const m = line.match(/^(.+?)(?:\s*[,;]\s*|\s+)(\d{1,2})\s*$/);
      if (m) {
        return {
          id: `p-${i}`,
          name: m[1].trim(),
          skill: Math.min(10, Math.max(1, parseInt(m[2], 10))),
        };
      }
      return { id: `p-${i}`, name: line, skill: 5 };
    });
}
