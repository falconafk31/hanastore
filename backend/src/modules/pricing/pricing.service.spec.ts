import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;
  const prisma = {
    equipment: {
      findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Excavator', dailyRate: 1000000 }),
    },
  };

  beforeEach(() => {
    // @ts-expect-error mock
    service = new PricingService(prisma);
  });

  it('should calculate 1 day correctly', async () => {
    const result = await service.calculate('1', '2026-10-01', '2026-10-01');
    expect(result.days).toBe(1);
    expect(result.total).toBe(1000000);
  });

  it('should apply discount for 7 days', async () => {
    const result = await service.calculate('1', '2026-10-01', '2026-10-07');
    expect(result.discountRate).toBe(0.05);
  });
});
