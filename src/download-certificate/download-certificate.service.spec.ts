import { Test, TestingModule } from '@nestjs/testing';
import { DownloadCertificateService } from './download-certificate.service';

describe('DownloadCertificateService', () => {
  let service: DownloadCertificateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DownloadCertificateService],
    }).compile();

    service = module.get<DownloadCertificateService>(DownloadCertificateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
