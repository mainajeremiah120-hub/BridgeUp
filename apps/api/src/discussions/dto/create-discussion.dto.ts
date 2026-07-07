import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDiscussionDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsString()
  @MaxLength(4000)
  body!: string;

  @IsString()
  @IsOptional()
  interestTag?: string;

  @IsString()
  @IsOptional()
  communityId?: string;
}
