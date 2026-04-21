export interface MailTransport {
  sendEmail(options: SendEmailOptions): Promise<void>;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
}
