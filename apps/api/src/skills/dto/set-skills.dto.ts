import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class SetSkillsDto {
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  teach!: string[];

  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  learn!: string[];
}
