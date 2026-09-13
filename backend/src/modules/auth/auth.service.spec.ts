import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: Record<string, unknown>;
  let jwtService: JwtService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as Record<string, unknown>;
    jwtService = new JwtService({ secret: 'test' });
    const config = { get: jest.fn((key: string, def?: string) => def || 'secret') } as unknown as ConfigService;
    // @ts-expect-error mock
    service = new AuthService(prisma, jwtService, config);
    jest.spyOn(jwtService, 'sign').mockReturnValue('token');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw conflict if email exists', async () => {
    (prisma['user'] as Record<string, jest.Mock>).findUnique.mockResolvedValue({ id: '1' });
    await expect(service.register({ name: 'A', email: 'a@a.com', password: 'password123' })).rejects.toThrow();
  });
});
