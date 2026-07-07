import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  interestTag?: string;

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsDateString()
  startsAt!: string;
}
