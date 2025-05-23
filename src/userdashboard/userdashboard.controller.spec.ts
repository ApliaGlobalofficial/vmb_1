import { Test, TestingModule } from '@nestjs/testing';
import { UserDashboardController } from './userdashboard.controller';

describe('UserdashboardController', () => {
  let controller: UserDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDashboardController],
    }).compile();

    controller = module.get<UserDashboardController>(UserDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
