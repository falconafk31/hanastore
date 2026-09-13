import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(() => {
    // @ts-expect-error mock
    service = new UsersService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFound if user not exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.findOne('uuid')).rejects.toThrow();
  });
});
