import { Controller, Get, Post, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ContractService } from './contract.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Post('generate/:bookingId')
  @Roles('admin', 'operator')
  generate(@Param('bookingId') bookingId: string) {
    return this.contractService.generate(bookingId);
  }

  @Get()
  @Roles('admin', 'operator')
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.contractService.list({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('booking/:bookingId')
  @Roles('admin', 'operator', 'customer')
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.contractService.findByBooking(bookingId);
  }

  @Get(':id')
  @Roles('admin', 'operator', 'customer')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Patch(':id/sign')
  @Roles('admin', 'customer')
  sign(@Param('id') id: string) {
    return this.contractService.sign(id);
  }
}
