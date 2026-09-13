import { ContractService } from './contract.service';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage/storage.service';

describe('ContractService', () => {
  let service: ContractService;
  const prisma = {
    booking: { findUnique: jest.fn().mockResolvedValue({ id: 'b1', status: 'confirmed', startDate: new Date(), endDate: new Date(), totalAmount: 1000000, user: { name: 'A', email: 'a@a.com' }, equipment: { name: 'Excavator', location: 'Jakarta' } }) },
    contract: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'c1' }), count: jest.fn(), findMany: jest.fn() },
  };
  const config = { get: jest.fn(() => 'test') } as unknown as ConfigService;
  const storage = new StorageService(config);
  jest.spyOn(storage, 'upload').mockResolvedValue({ url: 'https://r2.mock/contract.pdf', key: 'contracts/key' });

  beforeEach(() => {
    // @ts-expect-error mock
    service = new ContractService(prisma, storage);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate contract', async () => {
    const result = await service.generate('b1');
    expect(result.id).toBe('c1');
  });
});
