import { IsOptional, IsEnum } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'])
  status?: string;
}
