import { Transform, type TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

function trimString({ value }: TransformFnParams): unknown {
  const rawValue: unknown = value;
  return typeof rawValue === 'string' ? rawValue.trim() : rawValue;
}

export class RefreshDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
