import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  const prisma = {
    equipment: { findUnique: jest.fn().mockResolvedValue({ id: 'eq1', status: 'available', dailyRate: 1000000, name: 'Test' }) },
    booking: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'b1', status: 'pending' }),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
      delete: jest.fn(),
    },
    payment: { create: jest.fn().mockResolvedValue({}) },
  };
  const pricing = { calculate: jest.fn().mockResolvedValue({ total: 2000000 }) };

  beforeEach(() => {
    // @ts-expect-error mock
    service = new BookingService(prisma, pricing);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw conflict on overlapping booking', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({ id: 'existing' });
    await expect(service.create('user1', { equipmentId: 'eq1', startDate: '2026-10-01', endDate: '2026-10-05' })).rejects.toThrow();
  });

  it('should create booking when no overlap', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce(null);
    const result = await service.create('user1', { equipmentId: 'eq1', startDate: '2026-11-01', endDate: '2026-11-02' });
    expect(result.status).toBe('pending');
  });
});
