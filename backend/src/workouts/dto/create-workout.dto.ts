import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWorkoutDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsUUID()
  labelId?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  bodyWeight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsDateString()
  dateTime?: string;
}
