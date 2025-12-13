import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminDecisionDto {
  @IsIn(['APPROVE', 'REJECT'])
  @IsNotEmpty()
  readonly decision: 'APPROVE' | 'REJECT';

  @IsString()
  @IsOptional()
  readonly note?: string;
}
