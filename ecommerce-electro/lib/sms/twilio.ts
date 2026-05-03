import "server-only";

type SmsReparationParams = {
  nom: string;
  telephone: string;
  appareil: string;
  description: string;
};

type TwilioMessageResponse = {
  sid?: string;
  status?: string;
  error_message?: string | null;
  message?: string;
  code?: number;
};

export async function envoyerSmsProprio({
  nom,
  telephone,
  appareil,
  description,
}: SmsReparationParams) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.OWNER_PHONE;

  if (!accountSid || !authToken || !from || !to) {
    throw new Error("Configuration Twilio manquante.");
  }

  const body =
    "Nouvelle demande de reparation\n" +
    `De: ${nom} (${telephone})\n` +
    `Appareil: ${appareil}\n` +
    `Description: ${description.slice(0, 400)}`;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: to,
        Body: body,
      }),
    }
  );

  const payload = (await response.json().catch(() => null)) as TwilioMessageResponse | null;

  if (!response.ok) {
    const detail = payload?.message ?? response.statusText;
    throw new Error(`Twilio SMS impossible (${response.status}) : ${detail}`);
  }

  return payload;
}
