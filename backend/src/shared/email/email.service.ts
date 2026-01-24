import { Injectable } from '@nestjs/common';

type Transporter = {
  sendMail: (options: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<void>;
};

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;
  private fromAddress = 'no-reply@brisbaneleads.com';

  constructor() {
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const port = Number(process.env.EMAIL_PORT || 587);
    const secure =
      (process.env.EMAIL_SECURE || '').toLowerCase() === 'true' || port === 465;

    if (user) {
      this.fromAddress = process.env.EMAIL_FROM || user;
    }

    if (!host || !user || !pass) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodemailer = require('nodemailer');
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    } catch (error) {
      this.transporter = null;
    }
  }

  isConfigured(): boolean {
    return !!this.transporter;
  }

  async sendMagicLink(to: string, link: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email is not configured.');
    }

    const subject = 'Your Lead Exchange login link';
    const text = `Use this private link to access your seller dashboard:\n\n${link}\n\nThis link expires in 30 minutes.`;
    const html = `
      <p>Use this private link to access your seller dashboard:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 30 minutes.</p>
    `;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject,
      text,
      html,
    });
  }
}
