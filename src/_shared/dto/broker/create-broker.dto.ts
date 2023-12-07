import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateBrokerDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsUrl()
  @IsNotEmpty()
  readonly webhookUrl: string;
}
