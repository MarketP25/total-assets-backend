import { IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class CreateInvestmentDto {
  @IsUUID()
  @IsNotEmpty()
  readonly planId: string;

  @IsNumberString()
  @IsNotEmpty()
  readonly amount: string;
}
