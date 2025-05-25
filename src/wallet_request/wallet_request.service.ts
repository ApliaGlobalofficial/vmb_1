import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletRequest } from './entities/wallet_request.entity';
import { CreateWalletRequestDto } from './dto/create-wallet_request.dto';
import { UpdateWalletRequestDto } from './dto/update-wallet_request.dto';
import { WalletService } from '../wallet/wallet.service';
import { stringify } from 'querystring';

@Injectable()
export class WalletRequestService {
  constructor(
    @InjectRepository(WalletRequest)
    private readonly repo: Repository<WalletRequest>,
    private readonly walletService: WalletService,
  ) { }

  async create(dto: CreateWalletRequestDto, userId: number) {

    const userBalance = await this.walletService.getBalance(userId);
    console.log(`userBalance: ${JSON.stringify(userBalance)}`);

    if (!(dto.requested_amount <= userBalance)) {
      throw new Error('Amount must be less than or equal to the user balance');
    }
    


    const walletDto = {
      ...dto,
      user_id: userId
    };
    console.log({ walletDto });

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
