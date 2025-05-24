import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletRequest } from './entities/wallet_request.entity';
import { CreateWalletRequestDto } from './dto/create-wallet_request.dto';
import { UpdateWalletRequestDto } from './dto/update-wallet_request.dto';

@Injectable()
export class WalletRequestService {
  constructor(
    @InjectRepository(WalletRequest)
    private readonly repo: Repository<WalletRequest>,
  ) {}

  create(dto: CreateWalletRequestDto, userId: number) {
     const walletDto = { 
    ...dto, 
    user_id: userId
  };
  console.log({walletDto});
  
    const entity = this.repo.create(walletDto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const wr = await this.repo.findOneBy({ id });
    if (!wr) throw new NotFoundException(`WalletRequest #${id} not found`);
    return wr;
  }

  async update(id: number, dto: UpdateWalletRequestDto) {
    const wr = await this.findOne(id);
    Object.assign(wr, dto);
    return this.repo.save(wr);
  }

  async remove(id: number) {
    const wr = await this.findOne(id);
    return this.repo.remove(wr);
  }
}
