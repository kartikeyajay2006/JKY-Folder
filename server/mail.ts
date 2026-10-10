import nodemailer from 'nodemailer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  messageId: string;
}
export interface MailTransport {
  send: (message: MailMessage) => Promise<void>;
  close?: () => void;
  /** How messages leave the server: a real provider, or the local development outbox. */
  label?: 'smtp' | 'outbox';
}

/**
 * Development only: each message is written to DATA_DIR/outbox as a private .eml file instead
 * of being sent, so recovery and reminder links can be exercised without an email provider.
 */
export function outboxTransport(dataDir: string): MailTransport {
  if (process.env.NODE_ENV === 'production')
    throw Error('MAIL_TRANSPORT=outbox is for development only. Configure SMTP in production.');
  const dir = join(dataDir, 'outbox');
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  return {
    label: 'outbox',
    send: async (message) => {
      const date = new Date();
      const name = `${date.toISOString().replace(/[:.]/g, '-')}-${message.messageId.replace(/[^a-z0-9.-]/gi, '_').slice(0, 60)}.eml`;
      writeFileSync(
        join(dir, name),
        [
          `Date: ${date.toUTCString()}`,
          `To: ${message.to}`,
          `Subject: ${message.subject}`,
          `Message-ID: <${message.messageId}>`,
          'Content-Type: text/plain; charset=utf-8',
          '',
          message.text,
          '',
        ].join('\r\n'),
        { mode: 0o600, flag: 'wx' },
      );
    },
  };
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
    label: 'smtp',
    send: async (message) => {
      await transport.sendMail({ ...message, from: MAIL_FROM });
    },
    close: () => transport.close(),
  };
}
