import { PartialType } from '@nestjs/swagger';
import { CreateWalletDebitDto } from './create-wallet_debit.dto';

export class UpdateWalletDebitDto extends PartialType(CreateWalletDebitDto) {}
