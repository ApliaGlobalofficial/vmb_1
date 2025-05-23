import { Test, TestingModule } from '@nestjs/testing';
import { UserDashboardService } from './userdashboard.service';

describe('UserdashboardService', () => {
  let service: UserDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDashboardService],
    }).compile();

    service = module.get<UserDashboardService>(UserDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
