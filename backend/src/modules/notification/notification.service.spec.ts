import { NotificationService } from './notification.service';
import { ConfigService } from '@nestjs/config';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    const config = { get: jest.fn(() => undefined) } as unknown as ConfigService;
    service = new NotificationService(config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should mock email when no SMTP', async () => {
    const result = await service.sendEmail({ to: 'a@a.com', subject: 'Test', html: '<p>hi</p>' });
    expect(result.mocked).toBe(true);
  });

  it('should mock whatsapp', async () => {
    const result = await service.sendWhatsApp('0812', 'hello');
    expect(result.mocked).toBe(true);
  });
});
