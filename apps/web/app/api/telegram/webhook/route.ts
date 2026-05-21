import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await req.json();
  const message = body?.message;
  const chatId = message?.chat?.id?.toString();
  const text: string = message?.text ?? "";

  if (!chatId) return NextResponse.json({ ok: true });

  if (text.startsWith("/start")) {
    const slug = process.env.NEXT_PUBLIC_DEMO_ORG_SLUG ?? "demo";
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendTelegramMessage(
      `Kickoff подключён.\nLive: ${base}/live/${slug}\nAPI: ${base}/api/v1/${slug}/standings`,
      chatId,
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/link ")) {
    const slug = text.split(" ")[1]?.trim();
    const org = slug
      ? await prisma.organization.findUnique({ where: { slug } })
      : null;
    if (org) {
      await prisma.organization.update({
        where: { id: org.id },
        data: { telegramChatId: chatId },
      });
      await sendTelegramMessage(`Чат привязан к лиге ${org.name}`, chatId);
    } else {
      await sendTelegramMessage("Лига не найдена. /link demo", chatId);
    }
  }

  return NextResponse.json({ ok: true });
}
