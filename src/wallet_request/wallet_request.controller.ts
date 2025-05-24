import { Controller, Get, Post, Body,Req, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { WalletRequestService } from './wallet_request.service';
import { CreateWalletRequestDto } from './dto/create-wallet_request.dto';
import { UpdateWalletRequestDto } from './dto/update-wallet_request.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

@Controller('wallet_request')
@UseGuards(JwtAuthGuard)
export class WalletRequestController {
  constructor(private readonly service: WalletRequestService) {}

  @Post()
  create(@Req() req: Request,@Body() dto: CreateWalletRequestDto) {
    console.log(`userId: in ctroller ${JSON.stringify(req.user) } `, req.user);
    console.log(`dto: in ctroller ${JSON.stringify(req.user) } `, req.user);
    
    return this.service.create(dto, (req.user as any).userId);
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
