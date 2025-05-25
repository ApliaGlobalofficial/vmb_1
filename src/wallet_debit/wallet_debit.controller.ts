import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WalletDebitService } from './wallet_debit.service';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

@Controller('wallet_request/send')
export class WalletDebitController {
  constructor(private readonly service: WalletDebitService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async send(
    @Param('id') id: string,
    @Body() body: { account_number: string; ifsc_code: string; amount: number },
  ) {
    if (!body.account_number || !body.ifsc_code || !body.amount) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.service.sendMoney({
        id,
        account_number: body.account_number,
        ifsc_code: body.ifsc_code,
        amount: body.amount,
      });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
