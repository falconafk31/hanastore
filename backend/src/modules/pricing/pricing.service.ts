import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculate(equipmentId: string, startDate: string, endDate: string) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) throw new BadRequestException('Equipment not found');

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new BadRequestException('Invalid dates');
    if (start > end) throw new BadRequestException('startDate must be before endDate');

    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    if (days <= 0) throw new BadRequestException('Invalid duration');

    const dailyRate = Number(equipment.dailyRate);
    const total = dailyRate * days;

    // Discount logic: 7+ days 5%, 30+ days 10%
    let discountRate = 0;
    if (days >= 30) discountRate = 0.1;
    else if (days >= 7) discountRate = 0.05;

    const discountAmount = total * discountRate;
    const finalTotal = total - discountAmount;

    return {
      equipmentId,
      equipmentName: equipment.name,
      dailyRate,
      startDate,
      endDate,
      days,
      subtotal: total,
      discountRate,
      discountAmount,
      total: finalTotal,
    };
  }
}
