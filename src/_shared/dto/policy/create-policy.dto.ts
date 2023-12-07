import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Covers {
  @IsNumber()
  @IsNotEmpty()
  bikes_count: number;

  @IsNumber()
  @IsNotEmpty()
  bike_value: number;
}

export class CreatePolicyDto {
  @ValidateNested({ message: 'invalid cover' })
  @Type(() => Covers)
  @IsNotEmpty()
  covers: Covers;
}
