import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSetEntryDto {
  @IsObject()
  values: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
