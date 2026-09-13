import { EquipmentService } from './equipment.service';

describe('EquipmentService', () => {
  let service: EquipmentService;
  const prisma: Record<string, unknown> = {
    equipment: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: { findUnique: jest.fn().mockResolvedValue({ id: 'cat1' }), findMany: jest.fn() },
    booking: { findFirst: jest.fn().mockResolvedValue(null) },
  };

  beforeEach(() => {
    // @ts-expect-error mock
    service = new EquipmentService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check availability - no overlap', async () => {
    const result = await service.checkAvailability('1', '2026-10-01', '2026-10-05');
    expect(result.available).toBe(true);
  });
});
