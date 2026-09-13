import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    const config = {
      get: jest.fn((key: string, def?: string) => {
        if (key === 'R2_BUCKET') return 'test-bucket';
        return def;
      }),
    } as unknown as ConfigService;
    service = new StorageService(config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject executable file', async () => {
    const file = { originalname: 'test.exe', mimetype: 'application/octet-stream', size: 1000, buffer: Buffer.from('test') } as Express.Multer.File;
    await expect(service.upload(file)).rejects.toThrow();
  });
});
