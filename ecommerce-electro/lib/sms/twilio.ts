import "server-only";

type SmsReparationParams = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  type_appareil: string;
  marque: string;
  modele: string;
  description: string;
  disponibilites?: string;
};

type TwilioMessageResponse = {
  sid?: string;
  status?: string;
  error_message?: string | null;
  message?: string;
  code?: number;
};

export async function envoyerSmsProprio({
  prenom,
  nom,
  telephone,
  email,
  type_appareil,
  marque,
  modele,
  description,
  disponibilites,
}: SmsReparationParams) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.OWNER_PHONE;

  if (!accountSid || !authToken || !from || !to) {
    throw new Error("Configuration Twilio manquante.");
  }

  const lignes = [
    "Nouvelle demande de reparation",
    `De: ${prenom} ${nom}`,
    `Tel: ${telephone}`,
    `Email: ${email}`,
    `Appareil: ${type_appareil} ${marque} ${modele}`,
    `Probleme: ${description.slice(0, 280)}`,
  ];
  if (disponibilites) {
    lignes.push(`Dispos: ${disponibilites.slice(0, 120)}`);
  }
  const body = lignes.join("\n");

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
