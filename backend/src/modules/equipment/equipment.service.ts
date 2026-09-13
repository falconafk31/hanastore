import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEquipmentDto) {
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new BadRequestException('Category not found');
    return this.prisma.equipment.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        status: (dto.status as unknown as never) || 'available',
        dailyRate: dto.dailyRate,
        location: dto.location,
        photoUrl: dto.photoUrl,
      },
      include: { category: true },
    });
  }

  async findAll(query: QueryEquipmentDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where['name'] = { contains: query.search, mode: 'insensitive' };
    }
    if (query.categoryId) where['categoryId'] = query.categoryId;
    if (query.status) where['status'] = query.status;
    if (query.location) where['location'] = { contains: query.location, mode: 'insensitive' };

    // Efficient query - no N+1, include category
    const [data, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      this.prisma.equipment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  async update(id: string, dto: UpdateEquipmentDto) {
    await this.findOne(id);
    if (dto.categoryId) {
      const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!cat) throw new BadRequestException('Category not found');
    }
    return this.prisma.equipment.update({
      where: { id },
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        status: dto.status as unknown as never | undefined,
        dailyRate: dto.dailyRate,
        location: dto.location,
        photoUrl: dto.photoUrl,
      },
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.equipment.delete({ where: { id } });
    return { message: 'Equipment deleted' };
  }

  async checkAvailability(equipmentId: string, startDate: string, endDate: string) {
    await this.findOne(equipmentId);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new BadRequestException('Invalid date format');
    if (start > end) throw new BadRequestException('startDate must be before endDate');
    if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
      // allow past check for admin? but warn
    }

    // Efficient query: check overlap using DB query, not loop
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        equipmentId,
        status: { in: ['pending', 'confirmed', 'active'] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
    });

    return {
      equipmentId,
      startDate,
      endDate,
      available: !overlapping,
      conflictingBookingId: overlapping?.id || null,
    };
  }

  async getCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(name: string) {
    return this.prisma.category.create({ data: { name } });
  }
}
