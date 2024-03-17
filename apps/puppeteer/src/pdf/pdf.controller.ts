import { Controller, Get, Query } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Controller()
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('pdf')
  generatePDF(@Query('path') path: string) {
    return this.pdfService.generatePDF(path);
  }
}
