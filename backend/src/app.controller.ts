import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

@Controller()
export class AppController {
  @Post('convert')
  @UseInterceptors(FileInterceptor('file'))
  async convertExcelToCsv(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const csv = Papa.unparse(jsonData);

    res.header('Content-Type', 'text/csv');
    res.attachment('converted.csv');
    return res.send(csv);
  }
}
