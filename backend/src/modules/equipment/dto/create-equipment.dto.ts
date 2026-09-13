import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEquipmentDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsUUID()
  categoryId!: string;

  @IsEnum(['available', 'rented', 'maintenance', 'inactive'])
  @IsOptional()
  status?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dailyRate!: number;

  @IsString()
  @MaxLength(100)
  location!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;
}
