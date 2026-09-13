import { Controller, Get, Query } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { Public } from '../../common/guards/public.decorator';

@Controller('pricing')
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Public()
  @Get('calculate')
  calculate(
    @Query('equipmentId') equipmentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.pricingService.calculate(equipmentId, startDate, endDate);
  }
}
