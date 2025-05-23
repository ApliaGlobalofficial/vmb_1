import { Test, TestingModule } from '@nestjs/testing';
import { DownloadCertificateController } from './download-certificate.controller';

describe('DownloadCertificateController', () => {
  let controller: DownloadCertificateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DownloadCertificateController],
    }).compile();

    controller = module.get<DownloadCertificateController>(DownloadCertificateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
