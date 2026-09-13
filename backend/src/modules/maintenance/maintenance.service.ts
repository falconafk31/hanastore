import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMaintenanceDto) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id: dto.equipmentId } });
    if (!equipment) throw new NotFoundException('Equipment not found');
    return this.prisma.maintenanceLog.create({
      data: {
        equipmentId: dto.equipmentId,
        serviceDate: new Date(dto.serviceDate),
        notes: dto.notes,
        cost: dto.cost,
      },
      include: { equipment: true },
    });
  }

  async findAll(query: { page?: number; limit?: number; equipmentId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (query.equipmentId) where['equipmentId'] = query.equipmentId;
    const [data, total] = await Promise.all([
      this.prisma.maintenanceLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { serviceDate: 'desc' },
        include: { equipment: true },
      }),
      this.prisma.maintenanceLog.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const log = await this.prisma.maintenanceLog.findUnique({ where: { id }, include: { equipment: true } });
    if (!log) throw new NotFoundException('Maintenance log not found');
    return log;
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    await this.findOne(id);
    return this.prisma.maintenanceLog.update({
      where: { id },
      data: {
        serviceDate: dto.serviceDate ? new Date(dto.serviceDate) : undefined,
        notes: dto.notes,
        cost: dto.cost,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.maintenanceLog.delete({ where: { id } });
    return { message: 'Maintenance log deleted' };
  }
}
