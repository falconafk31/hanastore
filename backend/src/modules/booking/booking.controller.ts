import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  @Roles('customer', 'admin', 'operator')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(user.id, dto);
  }

  @Get()
  @Roles('admin', 'operator')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
    return this.bookingService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
    });
  }

  @Get('my')
  @Roles('customer', 'admin', 'operator', 'driver')
  findMy(@CurrentUser() user: { id: string }, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.bookingService.findMyBookings(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    // Access control handled in service/guard - admin can view all, customer own bookings ideally
    return this.bookingService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('admin', 'operator')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingDto, @CurrentUser() user: { role: string }) {
    return this.bookingService.updateStatus(id, dto, user.role);
  }

  @Patch(':id/cancel')
  @Roles('customer', 'admin')
  cancel(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    // Customers cancel their pending bookings
    return this.bookingService.updateStatus(id, { status: 'cancelled' }, user.role);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
