import { MaintenanceService } from './maintenance.service';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  const prisma = {
    equipment: { findUnique: jest.fn().mockResolvedValue({ id: 'eq1' }) },
    maintenanceLog: {
      create: jest.fn().mockResolvedValue({ id: 'm1' }),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'm1' }),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(() => {
    // @ts-expect-error mock
    service = new MaintenanceService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create log', async () => {
    const result = await service.create({ equipmentId: 'eq1', serviceDate: '2026-10-01', notes: 'Ganti oli', cost: 500000 });
    expect(result.id).toBe('m1');
  });
});
