import { Controller, Post, Get, Body, Param, Query, UseGuards, Req, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/guards/public.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto.bookingId, dto.paymentMethod);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('webhook')
  webhook(@Body() body: Record<string, unknown>, @Headers('x-callback-token') token?: string) {
    // In production verify signature; here we just process
    return this.paymentService.handleWebhook(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator', 'customer')
  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentService.findByBooking(bookingId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
    return this.paymentService.list({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.paymentService.confirmPaymentManually(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }
}
