import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class SetInterestsDto {
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  names!: string[];
}
