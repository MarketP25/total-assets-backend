import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class WithdrawDto {
  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  @IsNotEmpty()
  readonly amount: number;

  @IsString()
  @IsNotEmpty()
  readonly currency: string;
}
