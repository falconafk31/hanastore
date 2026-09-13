import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  const prefix = configService.get<string>('API_PREFIX', 'api');

  app.setGlobalPrefix(prefix);
  app.use(cookieParser());

  const frontendWebUrl = configService.get<string>('FRONTEND_WEB_URL', 'http://localhost:3001');
  const frontendAdminUrl = configService.get<string>('FRONTEND_ADMIN_URL', 'http://localhost:5173');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  const allowedOrigins =
    nodeEnv === 'production'
      ? [frontendWebUrl, frontendAdminUrl]
      : [frontendWebUrl, frontendAdminUrl, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // allow preview hosts for dev (e2b.app)
      if (origin.includes('.e2b.app')) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(port, '0.0.0.0');
  Logger.log(`Application is running on: http://localhost:${port}/${prefix}`, 'Bootstrap');
}
bootstrap();
