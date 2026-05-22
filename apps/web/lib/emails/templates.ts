const brand = "#22c55e";
const bg = "#0a0f0a";
const card = "#141a14";

function layout(title: string, body: string, cta?: { label: string; href: string }) {
  const ctaBlock = cta
    ? `<p style="margin:24px 0 0"><a href="${cta.href}" style="display:inline-block;background:${brand};color:#000;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:8px">${cta.label}</a></p>`
    : "";
  return `<!DOCTYPE html><html><body style="margin:0;background:${bg};font-family:system-ui,sans-serif;color:#e8ece8">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="100%" style="max-width:520px;background:${card};border-radius:12px;border:1px solid #1f2a1f" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 24px">
<p style="margin:0 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${brand}">Kickoff</p>
<h1 style="margin:0 0 16px;font-size:20px;font-weight:700">${title}</h1>
<div style="font-size:15px;line-height:1.5;color:#a8b0a8">${body}</div>
${ctaBlock}
</td></tr></table>
<p style="margin:16px 0 0;font-size:11px;color:#5a655a">Футбольная лига · Kickoff CRM</p>
</td></tr></table></body></html>`;
}

export function squadDeadlineEmail(opts: {
  matchLabel: string;
  hoursLeft: number;
  appUrl: string;
}) {
  const href = `${opts.appUrl}/club`;
  const text = `До матча ${opts.matchLabel} осталось около ${opts.hoursLeft} ч. Подайте заявку в кабинете клуба.`;
  return {
    subject: `[Kickoff] Дедлайн заявки — ${opts.matchLabel}`,
    text: `${text}\n\n${href}`,
    html: layout(
      "Дедлайн заявки",
      `<p>${text}</p>`,
      { label: "Открыть кабинет клуба", href },
    ),
  };
}

export function magicLinkEmail(opts: { name: string; link: string }) {
  const text = `Здравствуйте, ${opts.name}. Перейдите по ссылке для входа (действует 15 минут):\n${opts.link}`;
  return {
    subject: "[Kickoff] Ссылка для входа",
    text,
    html: layout(
      "Вход без пароля",
      `<p>Здравствуйте, <strong>${opts.name}</strong>.</p><p>Нажмите кнопку — ссылка действует 15 минут.</p>`,
      { label: "Войти в Kickoff", href: opts.link },
    ),
  };
}

export function notifyEmail(opts: { title: string; body: string; link?: string; appUrl: string }) {
  const href = opts.link ? `${opts.appUrl}${opts.link}` : opts.appUrl;
  const text = `${opts.body}${opts.link ? `\n\n${href}` : ""}`;
  return {
    subject: `[Kickoff] ${opts.title}`,
    text,
    html: layout(opts.title, `<p>${opts.body.replace(/\n/g, "<br/>")}</p>`, opts.link ? { label: "Открыть", href } : undefined),
  };
}
