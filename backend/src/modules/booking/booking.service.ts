import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id: dto.equipmentId } });
    if (!equipment) throw new NotFoundException('Equipment not found');
    if (equipment.status !== 'available') throw new BadRequestException(`Equipment is ${equipment.status}, not available`);

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new BadRequestException('Invalid dates');
    if (start > end) throw new BadRequestException('startDate must be before endDate');
    if (start < new Date(new Date().setHours(0, 0, 0, 0))) throw new BadRequestException('startDate cannot be in the past');

    // check overlap efficiently via DB
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        equipmentId: dto.equipmentId,
        status: { in: ['pending', 'confirmed', 'active'] },
        AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
      },
    });
    if (overlapping) throw new ConflictException('Equipment already booked for the selected dates');

    const pricing = await this.pricingService.calculate(dto.equipmentId, dto.startDate, dto.endDate);

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        equipmentId: dto.equipmentId,
        startDate: start,
        endDate: end,
        status: 'pending',
        totalAmount: pricing.total,
      },
      include: { equipment: { include: { category: true } }, user: { select: { id: true, name: true, email: true } } },
    });

    // create pending payment
    await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: pricing.total,
        status: 'pending',
      },
    });

    return booking;
  }

  async findAll(query: { page?: number; limit?: number; status?: string; userId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (query.status) where['status'] = query.status;
    if (query.userId) where['userId'] = query.userId;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { equipment: { include: { category: true } }, user: { select: { id: true, name: true, email: true } }, payments: true, contract: true },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { equipment: { include: { category: true } }, user: { select: { id: true, name: true, email: true } }, payments: true, contract: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findMyBookings(userId: string, query: { page?: number; limit?: number }) {
    return this.findAll({ ...query, userId });
  }

  async updateStatus(id: string, dto: UpdateBookingDto, actorRole?: string) {
    const booking = await this.findOne(id);

    // Only admin/operator can confirm/reject/active; customer can cancel pending
    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled', 'rejected'],
      confirmed: ['active', 'cancelled'],
      active: ['completed'],
      cancelled: [],
      rejected: [],
      completed: [],
    };

    if (dto.status && !allowedTransitions[booking.status]?.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${dto.status}`);
    }

    if (dto.status) {
      const updated = await this.prisma.booking.update({
        where: { id },
        data: { status: dto.status as unknown as never },
        include: { equipment: true, user: true },
      });

      // If booking completed/cancelled, could free equipment logic elsewhere
      return updated;
    }

    return booking;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.booking.delete({ where: { id } });
    return { message: 'Booking deleted' };
  }
}
