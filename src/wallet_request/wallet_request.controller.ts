// import { Controller, Get, Post, Body,Req, Patch, Param, Delete,UseGuards } from '@nestjs/common';
// import { WalletRequestService } from './wallet_request.service';
// import { CreateWalletRequestDto } from './dto/create-wallet_request.dto';
// import { UpdateWalletRequestDto } from './dto/update-wallet_request.dto';
// import { Request } from 'express';
// import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

// @Controller('wallet_request')
// @UseGuards(JwtAuthGuard)
// export class WalletRequestController {
//   constructor(private readonly service: WalletRequestService) {}

//   @Post()
//   create(@Req() req: Request,@Body() dto: CreateWalletRequestDto) {
//     console.log(`userId: in ctroller ${JSON.stringify(req.user) } `, req.user);
//     console.log(`dto: in ctroller ${JSON.stringify(req.user) } `, req.user);
//     console.log('req user is ', req.user);
    
    
//     return this.service.create(dto, (req.user as any).userId);
//   }

//   @Get()
//   findAll() {
//     return this.service.findAll();
//   }

//   // wallet_request.controller.ts
// @Get('my')
// getMyRequests(@Req() req: Request) {
//   const userId = (req.user as any).userId;
//   return this.service.findByUserId(userId);
// }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.service.findOne(+id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id') id: string,
//     @Body() dto: UpdateWalletRequestDto,
//   ) {
//     return this.service.update(+id, dto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.service.remove(+id);
//   }
// }

import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

import { WalletRequestService } from './wallet_request.service';
import { CreateWalletRequestDto } from './dto/create-wallet_request.dto';
import { UpdateWalletRequestDto } from './dto/update-wallet_request.dto';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

@Controller('wallet_request')
@UseGuards(JwtAuthGuard)
export class WalletRequestController {
  constructor(private readonly service: WalletRequestService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWalletRequestDto) {
    const userId = (req.user as any).userId;
    return this.service.create(dto, userId);
  }

  @Post(':id/upload-screenshot')
  @UseInterceptors(
    FileInterceptor('payment_screenshot', {
      storage: diskStorage({
        destination: './uploads/payment_screenshots',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `screenshot-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadScreenshot(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const filePath = `uploads/payment_screenshots/${file.filename}`;
    return this.service.saveScreenshot(+id, filePath);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('my')
  getMyRequests(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.service.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWalletRequestDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
