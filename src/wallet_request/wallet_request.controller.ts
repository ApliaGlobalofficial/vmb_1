import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WalletRequestService } from './wallet_request.service';
import { CreateWalletRequestDto } from './dto/create-wallet_request.dto';
import { UpdateWalletRequestDto } from './dto/update-wallet_request.dto';

@Controller('wallet_request')
export class WalletRequestController {
  constructor(private readonly service: WalletRequestService) {}

  @Post()
  create(@Body() dto: CreateWalletRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWalletRequestDto,
  ) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
