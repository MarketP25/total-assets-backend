import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateInvestmentDto {
  @IsUUID()
  planId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}