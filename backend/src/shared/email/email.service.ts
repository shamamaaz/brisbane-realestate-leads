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
  private fromAddress = 'no-reply@leadexchange.com';

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

  async sendPasswordReset(to: string, link: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email is not configured.');
    }

    const subject = 'Reset your Lead Exchange password';
    const text = `Use this link to reset your password:\n\n${link}\n\nThis link expires in 60 minutes.`;
    const html = `
      <p>Use this link to reset your password:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 60 minutes.</p>
    `;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject,
      text,
      html,
    });
  }

  async sendOfferNotification(to: string, link: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email is not configured.');
    }

    const subject = 'An agent has sent you an appraisal offer';
    const text = `An agent has responded to your appraisal request.\n\nSign in to view the offer:\n${link}`;
    const html = `
      <p>An agent has responded to your appraisal request.</p>
      <p><a href="${link}">Sign in to view the offer</a></p>
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
