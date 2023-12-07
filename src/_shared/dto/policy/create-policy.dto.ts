import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @ValidateNested({ message: 'invalid cover' })
  @Type(() => Covers)
  @IsNotEmpty()
  covers: Covers;
}
