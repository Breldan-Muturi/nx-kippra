import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  constructor(private readonly configService: ConfigService) {}

  async generatePDF({
    applicationId,
    template,
  }: {
    applicationId: string;
    template: string;
  }) {
    const browser = await puppeteer.launch({
      args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--single-process',
        '--no-zygote',
      ],
      executablePath:
        this.configService.get('NODE_ENV') === 'production'
          ? this.configService.get('PUPPETEER_EXECUTABLE_PATH')
          : puppeteer.executablePath(),
    });
    console.log('Nextjs url: ', this.configService.get('NEXT_PUBLIC_APP_URL'));
    console.log(
      'Puppeteer secret: ',
      this.configService.get('PUPPETEER_SECRET'),
    );
    try {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'x-puppeteer-secret': this.configService.get(
          'PUPPETEER_SECRET',
        ) as string,
      });
      const response = await page.goto(
        `${this.configService.get('NEXT_PUBLIC_APP_URL')}/${applicationId}/${template}`,
        {
          waitUntil: 'networkidle2',
          timeout: 20000,
        },
      );
      if (!response || response?.status() !== 200) {
        throw new Error(
          `Failed to load page, status code ${response?.status()}`,
        );
      }
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
      const pdfBuffer = Buffer.from(pdf.buffer);
      return { generatedPDF: pdfBuffer };
    } catch (e) {
      console.log('Error with generating pdf: ', e);
      return { error: 'Error with generating pdf' };
    } finally {
      await browser.close();
    }
  }
}
