import { IsUUID, IsDateString, IsString, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaintenanceDto {
  @IsUUID()
  equipmentId!: string;

  @IsDateString()
  serviceDate!: string;

  @IsString()
  @MaxLength(1000)
  notes!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost!: number;
}
