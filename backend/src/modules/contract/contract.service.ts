import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async generate(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, equipment: true, payments: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'confirmed' && booking.status !== 'active' && booking.status !== 'completed') {
      // allow pending but warn
      if (booking.status === 'pending') throw new BadRequestException('Booking must be confirmed before generating contract');
    }

    const existing = await this.prisma.contract.findUnique({ where: { bookingId } });
    if (existing) return existing;

    // Generate simple contract document content (in production use PDF library)
    const contractContent = this.buildContractContent(booking);
    const buffer = Buffer.from(contractContent, 'utf-8');
    const file = {
      originalname: `contract-${bookingId}.pdf`,
      mimetype: 'application/pdf',
      size: buffer.length,
      buffer,
    } as Express.Multer.File;

    const { url } = await this.storageService.upload(file, 'contracts');

    const contract = await this.prisma.contract.create({
      data: {
        bookingId,
        docUrl: url,
        signed: false,
      },
    });

    this.logger.log(`Contract generated for booking ${bookingId}: ${url}`);
    return contract;
  }

  async findByBooking(bookingId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { bookingId }, include: { booking: true } });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id }, include: { booking: true } });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async sign(id: string) {
    const contract = await this.findOne(id);
    if (contract.signed) throw new BadRequestException('Already signed');
    return this.prisma.contract.update({
      where: { id },
      data: { signed: true, signedAt: new Date() },
    });
  }

  async list(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { booking: { include: { equipment: true, user: true } } } }),
      this.prisma.contract.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private buildContractContent(booking: { id: string; startDate: Date; endDate: Date; totalAmount: unknown; user: { name: string; email: string }; equipment: { name: string; location: string } }): string {
    return `
KONTRAK SEWA ALAT BERAT - HANASTORE
====================================
No. Kontrak: CTR-${booking.id.slice(0, 8).toUpperCase()}
Tanggal: ${new Date().toISOString().split('T')[0]}

PIHAK PERTAMA (Penyedia): HanaStore Heavy Equipment
PIHAK KEDUA (Penyewa): ${booking.user.name} (${booking.user.email})

DETAIL ALAT:
- Alat: ${booking.equipment.name}
- Lokasi: ${booking.equipment.location}
- Periode: ${new Date(booking.startDate).toISOString().split('T')[0]} s/d ${new Date(booking.endDate).toISOString().split('T')[0]}
- Total Biaya: Rp ${Number(booking.totalAmount).toLocaleString('id-ID')}

SYARAT & KETENTUAN:
1. Penyewa wajib menjaga alat dengan baik.
2. Keterlambatan pengembalian dikenakan denda 10% per hari.
3. Kontrak ini sah setelah ditandatangani kedua belah pihak.

Tanda Tangan:
Penyedia: ___________________    Penyewa: ___________________
    `.trim();
  }
}
