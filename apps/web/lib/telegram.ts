export async function sendTelegramMessage(text: string, chatId?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const target = chatId ?? process.env.TELEGRAM_DEFAULT_CHAT_ID;
  if (!token || !target) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[kickoff:telegram]", target ?? "no-chat", text);
    }
    return false;
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: target,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    },
  );
  return res.ok;
}

export async function notifyOrgTelegram(
  organizationId: string,
  text: string,
) {
  const { prisma } = await import("@/lib/db");
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { telegramChatId: true, name: true },
  });
  if (!org?.telegramChatId) return false;
  return sendTelegramMessage(`<b>${org.name}</b>\n${text}`, org.telegramChatId);
}
