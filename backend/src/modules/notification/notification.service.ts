import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: false,
        auth: { user, pass },
      });
    } else {
      this.logger.warn('SMTP not configured - emails will be mocked/logged');
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ messageId?: string; mocked?: boolean }> {
    if (!this.transporter) {
      this.logger.log(`[MOCK EMAIL] To: ${options.to} Subject: ${options.subject}`);
      this.logger.log(`Body: ${options.html.substring(0, 500)}`);
      return { mocked: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@hanastore.local'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent: ${info.messageId} to ${options.to}`);
      return { messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${(error as Error).message}`);
      throw error;
    }
  }

  async sendBookingConfirmation(to: string, booking: { id: string; equipmentName: string; startDate: string; endDate: string; total: number }) {
    const html = `
      <h2>Konfirmasi Booking - HanaStore</h2>
      <p>Booking Anda telah dibuat:</p>
      <ul>
        <li>ID: ${booking.id}</li>
        <li>Alat: ${booking.equipmentName}</li>
        <li>Periode: ${booking.startDate} s/d ${booking.endDate}</li>
        <li>Total: Rp ${booking.total.toLocaleString('id-ID')}</li>
      </ul>
      <p>Silakan lakukan pembayaran untuk konfirmasi.</p>
    `;
    return this.sendEmail({ to, subject: 'Konfirmasi Booking HanaStore', html });
  }

  async sendStatusUpdate(to: string, bookingId: string, status: string) {
    const html = `<p>Status booking <strong>${bookingId}</strong> telah berubah menjadi <strong>${status}</strong>.</p>`;
    return this.sendEmail({ to, subject: `Update Status Booking ${status}`, html });
  }

  // Placeholder for WhatsApp API
  async sendWhatsApp(to: string, message: string): Promise<{ mocked: boolean; to: string; message: string }> {
    // Interface ready for real WhatsApp API (e.g., Twilio, Wablas, Fonnte)
    this.logger.log(`[MOCK WHATSAPP] To: ${to} Message: ${message.substring(0, 200)}`);
    // TODO: Integrate real WhatsApp provider via env WHATSAPP_API_URL & WHATSAPP_API_TOKEN
    return { mocked: true, to, message };
  }
}
