import {
  IsString,
  IsNumber,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';

export class CreditWalletDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly currency: string;

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  readonly amount: number;
}