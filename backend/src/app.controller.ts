import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { ConvertExcelDto } from './dto/convert-excel.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('convert')
  @UseInterceptors(FileInterceptor('file'))
  @Header('Content-Type', 'text/plain')
  async convertExcelToVslfText(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ConvertExcelDto,
  ): Promise<StreamableFile> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = this.appService.convertExcelToVslfText(
      file.buffer,
      body.form_year,
      body.form_month,
    );

    return new StreamableFile(Buffer.from(result.content), {
      type: 'text/plain',
      disposition: `attachment; filename="${result.filename}"`,
    });
  }
}
