import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfService {
  constructor(private readonly configService: ConfigService) {}

  async generatePDF(path: string) {
    return path;
  }
}
