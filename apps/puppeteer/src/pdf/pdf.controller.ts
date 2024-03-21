import { Controller, Get, Query } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { CreatePdfDto } from '../dtos/create-pdf.dto';

@Controller()
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('pdf')
  generatePDF(@Query() createPdfDto: CreatePdfDto) {
    return this.pdfService.generatePDF(createPdfDto);
  }
}
