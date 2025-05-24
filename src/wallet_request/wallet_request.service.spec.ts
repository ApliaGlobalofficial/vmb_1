import { Test, TestingModule } from '@nestjs/testing';
import { WalletRequestService } from './wallet_request.service';

describe('WalletRequestService', () => {
  let service: WalletRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletRequestService],
    }).compile();

    service = module.get<WalletRequestService>(WalletRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
