import { Test, TestingModule } from '@nestjs/testing';
import { WalletDebitService } from './wallet_debit.service';

describe('WalletDebitService', () => {
  let service: WalletDebitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletDebitService],
    }).compile();

    service = module.get<WalletDebitService>(WalletDebitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
