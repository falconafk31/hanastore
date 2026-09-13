import { IsUUID, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  bookingId!: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
