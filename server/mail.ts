import nodemailer from 'nodemailer';
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  messageId: string;
}
export interface MailTransport {
  send: (message: MailMessage) => Promise<void>;
  close?: () => void;
}
export function smtpTransport(): MailTransport | undefined {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM } = process.env;
  if (!SMTP_HOST && !MAIL_FROM) return undefined;
  if (!SMTP_HOST || !MAIL_FROM || !/^([^<>\s]+@[^<>\s]+)$/.test(MAIL_FROM))
    throw Error('SMTP_HOST and a plain MAIL_FROM address are required.');
  if ((SMTP_USER && !SMTP_PASSWORD) || (!SMTP_USER && SMTP_PASSWORD))
    throw Error('SMTP credentials must be configured together.');
  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid SMTP_PORT.');
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    dnsTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
    logger: false,
    debug: false,
  });
  return {
    send: async (message) => {
      await transport.sendMail({ ...message, from: MAIL_FROM });
    },
    close: () => transport.close(),
  };
}
