import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreditWalletDto {
  @IsUUID()
  @IsNotEmpty()
  readonly userId!: string;

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  @IsNotEmpty()
  readonly amount!: number;

  @IsString()
  @IsNotEmpty()
  readonly currency!: string;

  @IsString()
  @IsOptional()
  readonly adminNote?: string;
}
