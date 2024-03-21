import { Controller, Get, Query } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Controller()
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('pdf')
  generatePDF(
    @Query('applicationId') applicationId: string,
    @Query('template') template: string,
  ) {
    return this.pdfService.generatePDF({ applicationId, template });
  }
}
