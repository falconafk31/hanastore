import { IsUUID, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  equipmentId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
