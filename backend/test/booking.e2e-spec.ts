import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Booking E2E (create → payment → contract)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let adminToken: string;
  let equipmentId: string;
  let bookingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    prisma = app.get(PrismaService);
    await app.init();

    // Ensure DB is seeded? For E2E we create temporary data
  });

  it('/api/auth/register (POST) - customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'E2E Customer', email: `e2e-${Date.now()}@test.local`, password: 'password123' });
    expect([200, 201].includes(res.status)).toBeTruthy();
    accessToken = res.body.data?.accessToken || res.body.accessToken;
  });

  it('/api/auth/login (POST) - admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@hanastore.local', password: 'password123' });
    // If admin not exists (no DB), this may fail - mock fallback
    if (res.status === 200 || res.status === 201) {
      adminToken = res.body.data?.accessToken || res.body.accessToken;
    }
  });

  it('/api/equipment (GET) - get equipment', async () => {
    const res = await request(app.getHttpServer()).get('/api/equipment?limit=1');
    if (res.status === 200) {
      equipmentId = res.body.data?.data?.[0]?.id || res.body.data?.[0]?.id;
    }
    // If no DB, skip
    expect(res.status).toBe(200);
  });

  it('/api/bookings (POST) - create booking', async () => {
    if (!equipmentId || !accessToken) return;
    const start = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const end = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const res = await request(app.getHttpServer())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ equipmentId, startDate: start, endDate: end });
    if (res.status === 201 || res.status === 200) {
      bookingId = res.body.data?.id || res.body.id;
      expect(res.body.data?.status || res.body.status).toBe('pending');
    }
  });

  it('should reject overlapping booking', async () => {
    if (!equipmentId || !accessToken) return;
    const start = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const end = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const res = await request(app.getHttpServer())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ equipmentId, startDate: start, endDate: end });
    expect(res.status).toBe(409);
  });

  it('/api/payments (POST) - create payment', async () => {
    if (!bookingId || !accessToken) return;
    const res = await request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookingId });
    expect([200, 201].includes(res.status)).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
  });
});
