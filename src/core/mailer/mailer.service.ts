import type { SendEmailOptions, MailTransport } from "../interface.js";
import { smtpTransport } from "../transports/smtp.transport.js";

const transports: Record<string, MailTransport> = {
  smtp: smtpTransport,
};

const getTransport = (): MailTransport => {
  const provider = process.env.MAILER_PROVIDER || "smtp";
  const transport = transports[provider];

  if (!transport) {
    throw new Error(
      `Unknown mailer provider: "${provider}". Available: ${Object.keys(transports).join(", ")}`,
    );
  }

  return transport;
};

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  void getTransport().sendEmail(options);
};
