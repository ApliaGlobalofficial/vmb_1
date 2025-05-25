import { Test, TestingModule } from '@nestjs/testing';
import { WalletDebitController } from './wallet_debit.controller';
import { WalletDebitService } from './wallet_debit.service';

describe('WalletDebitController', () => {
  let controller: WalletDebitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletDebitController],
      providers: [WalletDebitService],
    }).compile();

    controller = module.get<WalletDebitController>(WalletDebitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
