import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class AppService {
  convertExcelToVslfText(
      fileBuffer: Buffer,
      formYear: string,
      formMonth: string,
  ): { filename: string; content: string } {
    const yearMonth = `${formYear}${formMonth}`;
    const filename = `VSLF_${yearMonth}.txt`;

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new BadRequestException('Excel file has no sheets');
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rows.length === 0) {
      throw new BadRequestException('Excel file is empty');
    }

    const titles = rows[0];
    const personalNrIndex = titles.indexOf('Personal Nr.SBB');

    if (personalNrIndex === -1) {
      throw new BadRequestException('Column "Personal Nr.SBB" not found');
    }

    const now = new Date();
    const timestamp =
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');

    const betrag = 30.0;
    let total = 0.0;
    let anzahlRecords = 0;

    let output = `TOP${timestamp}\n`;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const personalNrValue = row[personalNrIndex];

      if (personalNrValue !== undefined && personalNrValue !== null) {
        const sbbPersonalnummer = personalNrValue.toString().padStart(8, '0');
        const formattedBetrag = Math.floor(betrag).toString().padStart(10, '0');

        total += betrag;
        anzahlRecords++;

        output += `${sbbPersonalnummer}${yearMonth}018030${formattedBetrag}.00\n`;
      }
    }

    const formattedTotal = Math.floor(total).toString().padStart(10, '0');
    output += `END${timestamp}_${anzahlRecords}_${formattedTotal}.00`;

    return { filename, content: output };
  }
}