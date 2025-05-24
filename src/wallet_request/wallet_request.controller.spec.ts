import { Test, TestingModule } from '@nestjs/testing';
import { WalletRequestController } from './wallet_request.controller';
import { WalletRequestService } from './wallet_request.service';

describe('WalletRequestController', () => {
  let controller: WalletRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletRequestController],
      providers: [WalletRequestService],
    }).compile();

    controller = module.get<WalletRequestController>(WalletRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
