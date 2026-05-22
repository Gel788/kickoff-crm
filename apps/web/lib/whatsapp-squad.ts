export type WhatsAppSquadPlayer = {
  name: string;
  number: number | null;
  isStarter: boolean;
};

export function formatSquadWhatsApp(params: {
  clubName: string;
  opponent: string;
  datetime: string;
  venue?: string | null;
  players: WhatsAppSquadPlayer[];
}): string {
  const starters = params.players.filter((p) => p.isStarter);
  const bench = params.players.filter((p) => !p.isStarter);

  const line = (p: WhatsAppSquadPlayer) =>
    `${p.number != null ? `${p.number}. ` : "• "}${p.name}`;

  const parts = [
    `*${params.clubName}*`,
    `*vs ${params.opponent}*`,
    `📅 ${params.datetime}`,
  ];
  if (params.venue) parts.push(`📍 ${params.venue}`);
  parts.push("");
  if (starters.length > 0) {
    parts.push("*Основа:*", ...starters.map(line));
  }
  if (bench.length > 0) {
    parts.push("", "*Запас:*", ...bench.map(line));
  }
  parts.push("", "_Kickoff · заявка на матч_");
  return parts.join("\n");
}
