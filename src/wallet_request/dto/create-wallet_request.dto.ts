import { IsInt, IsOptional, IsString, IsDateString, IsDecimal, IsEnum } from 'class-validator';

export enum WalletRequestStatus {
  Pending   = 'Pending',
  Approved  = 'Approved',
  Rejected  = 'Rejected',
  Uploaded  = 'Uploaded',
  Completed = 'Completed',
  Sent      = 'Sent',
  Received  = 'Received',
}

export class CreateWalletRequestDto {
  @IsInt()
  user_id: number;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  ifsc_code?: string;

  @IsOptional()
  @IsDecimal()
  requested_amount?: number;

  @IsOptional()
  @IsDateString()
  requested_amount_date?: string;

  @IsOptional()
  @IsDateString()
  sent_amount_date?: string;

  @IsOptional()
  @IsEnum(WalletRequestStatus, {
    message: `status must be one of: ${Object.values(WalletRequestStatus).join(', ')}`,
  })
  status?: WalletRequestStatus;
}
