import { IsOptional, IsDateString, IsString, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsDateString()
  serviceDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;
}
