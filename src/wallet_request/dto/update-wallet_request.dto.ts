import { PartialType } from '@nestjs/mapped-types';
import { CreateWalletRequestDto } from './create-wallet_request.dto';

export class UpdateWalletRequestDto extends PartialType(CreateWalletRequestDto) {}
