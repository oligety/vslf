import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BadRequestException, StreamableFile } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            convertExcelToVslfText: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('convertExcelToVslfText', () => {
    it('should call appService.convertExcelToVslfText and return StreamableFile', async () => {
      const mockFile = {
        buffer: Buffer.from('mock content'),
        originalname: 'test.xlsx',
      } as Express.Multer.File;
      const mockBody = { form_year: '2026', form_month: '03' };
      const mockResult = {
        filename: 'VSLF_202603.txt',
        content: 'TOP...\nEND...',
      };

      jest.spyOn(appService, 'convertExcelToVslfText').mockReturnValue(mockResult);

      const result = await appController.convertExcelToVslfText(mockFile, mockBody);

      expect(appService.convertExcelToVslfText).toHaveBeenCalledWith(
        mockFile.buffer,
        mockBody.form_year,
        mockBody.form_month,
      );
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should throw BadRequestException if no file is provided', async () => {
      const mockBody = { form_year: '2026', form_month: '03' };

      await expect(appController.convertExcelToVslfText(undefined as any, mockBody)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
