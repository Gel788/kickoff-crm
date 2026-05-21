type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Kickoff <noreply@kickoff.app>";

  if (process.env.NODE_ENV !== "production") {
    console.log("[kickoff:email]", payload.to, payload.subject, payload.text);
  }

  if (!apiKey) {
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        html: payload.html ?? `<p>${payload.text}</p>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
