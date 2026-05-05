import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateWorkoutLabelDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'color must be a hex code like #RGB or #RRGGBB',
  })
  color?: string;
}
