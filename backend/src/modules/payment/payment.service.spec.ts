import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';

describe('PaymentService', () => {
  let service: PaymentService;
  const prisma = {
    booking: { findUnique: jest.fn().mockResolvedValue({ id: 'b1', status: 'pending', totalAmount: 2000000 }) },
    payment: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'p1', status: 'pending' }),
      update: jest.fn().mockResolvedValue({ id: 'p1', status: 'pending' }),
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(() => {
    const config = { get: jest.fn(() => 'false') } as unknown as ConfigService;
    // @ts-expect-error mock
    service = new PaymentService(prisma, config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle webhook settlement', async () => {
    prisma.payment.findFirst = jest.fn().mockResolvedValue({ id: 'p1', bookingId: 'b1' });
    prisma.payment.update = jest.fn().mockResolvedValue({});
    // @ts-expect-error mock
    prisma.booking = { update: jest.fn().mockResolvedValue({}) };
    const result = await service.handleWebhook({ order_id: 'ORDER-123', transaction_status: 'settlement', fraud_status: 'accept' });
    expect(result.newStatus).toBe('paid');
  });
});
