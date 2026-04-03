import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ConvertExcelDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString())
  form_year: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])$/, {
    message: 'form_month must be a two-digit month from 01 to 12',
  })
  @Transform(({ value }) => value?.toString().padStart(2, '0'))
  form_month: string;
}