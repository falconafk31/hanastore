import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { BookingModule } from './modules/booking/booking.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ContractModule } from './modules/contract/contract.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { StorageModule } from './modules/storage/storage.module';
import { NotificationModule } from './modules/notification/notification.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          // lazyConnect true prevents crash if redis not available in dev
          lazyConnect: true,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EquipmentModule,
    BookingModule,
    PricingModule,
    PaymentModule,
    ContractModule,
    MaintenanceModule,
    StorageModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
