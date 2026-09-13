import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createPayment(bookingId: string, paymentMethod?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'cancelled' || booking.status === 'rejected') throw new BadRequestException('Cannot pay for cancelled/rejected booking');

    // Use existing pending payment or create
    let payment = await this.prisma.payment.findFirst({
      where: { bookingId, status: 'pending' },
    });

    if (!payment) {
      if (!booking.totalAmount) throw new BadRequestException('Booking amount not set');
      payment = await this.prisma.payment.create({
        data: {
          bookingId,
          amount: booking.totalAmount,
          status: 'pending',
          paymentMethod: paymentMethod || 'midtrans',
        },
      });
    }

    // Midtrans mock integration
    const midtransOrderId = `ORDER-${bookingId.slice(0, 8)}-${Date.now()}`;
    const midtransToken = `mock-token-${midtransOrderId}`;
    const isProduction = this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true';

    // Update payment with midtrans data
    payment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        midtransOrderId,
        midtransToken,
        paymentMethod: paymentMethod || 'midtrans',
      },
    });

    this.logger.log(`Payment created for booking ${bookingId}: ${midtransOrderId}`);

    // In real integration, call Midtrans Snap API here
    // For now return mock redirect URL
    const snapUrl = isProduction
      ? `https://app.midtrans.com/snap/v2/vtweb/${midtransToken}`
      : `https://app.sandbox.midtrans.com/snap/v2/vtweb/${midtransToken}`;

    return {
      payment,
      midtrans: {
        orderId: midtransOrderId,
        token: midtransToken,
        redirectUrl: snapUrl,
      },
    };
  }

  async handleWebhook(payload: Record<string, unknown>) {
    this.logger.log(`Webhook received: ${JSON.stringify(payload)}`);
    const orderId = payload['order_id'] as string;
    const transactionStatus = payload['transaction_status'] as string;
    const fraudStatus = payload['fraud_status'] as string;

    if (!orderId) throw new BadRequestException('Missing order_id');

    const payment = await this.prisma.payment.findFirst({ where: { midtransOrderId: orderId } });
    if (!payment) throw new NotFoundException('Payment not found for order');

    let newStatus: string | null = null;
    let bookingStatus: string | null = null;

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        newStatus = 'paid';
        bookingStatus = 'confirmed';
      }
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending';
    } else if (['deny', 'expire', 'failure', 'cancel'].includes(transactionStatus)) {
      newStatus = transactionStatus === 'expire' ? 'expired' : 'failed';
      bookingStatus = 'cancelled';
    }

    if (newStatus) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: newStatus as never, paidAt: newStatus === 'paid' ? new Date() : undefined },
      });
    }

    if (bookingStatus) {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: bookingStatus as never },
      });
      // Contract auto-generation could be triggered here via event
    }

    return { message: 'Webhook processed', paymentId: payment.id, newStatus };
  }

  async findByBooking(bookingId: string) {
    return this.prisma.payment.findMany({ where: { bookingId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id }, include: { booking: true } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async confirmPaymentManually(paymentId: string) {
    const payment = await this.findOne(paymentId);
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'paid', paidAt: new Date() },
    });
    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'confirmed' },
    });
    return { message: 'Payment confirmed manually' };
  }

  async list(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (query.status) where['status'] = query.status;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { booking: true } }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
