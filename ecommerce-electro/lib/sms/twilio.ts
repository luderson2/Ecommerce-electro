import "server-only";

import twilio from "twilio";

type SmsReparationParams = {
  nom: string;
  telephone: string;
  appareil: string;
  description: string;
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

  const client = twilio(accountSid, authToken);
  const body =
    "Nouvelle demande de réparation\n" +
    `De: ${nom} (${telephone})\n` +
    `Appareil: ${appareil}\n` +
    `Description: ${description.slice(0, 400)}`;

  return client.messages.create({ from, to, body });
}
