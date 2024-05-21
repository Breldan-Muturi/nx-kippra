import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { ElementHandle, Page } from 'puppeteer';
import { CreatePdfDto } from '../dtos/create-pdf.dto';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  constructor(private readonly configService: ConfigService) {}

  async isImageLoaded(
    page: Page,
    imageElementHandle: ElementHandle<HTMLImageElement>,
  ): Promise<boolean> {
    for (let totalIdleTime = 0; totalIdleTime < 3000; totalIdleTime += 500) {
      if (totalIdleTime > 0) await page.waitForNetworkIdle({ idleTime: 500 });
      if (
        (await imageElementHandle.evaluate(
          (imageDomElement) => imageDomElement.naturalWidth,
        )) > 0
      ) {
        return true;
      }
    }
    return false;
  }

  async generatePDF({ applicationId, template }: CreatePdfDto) {
    this.logger.debug(
      `Nextjs url: ${this.configService.get('PUPPETEER_ACCESS_ROUTE')}/templates/${applicationId}/${template}`,
    );
    this.logger.debug(
      `Puppeteer secret: ${this.configService.get('PUPPETEER_SECRET')}`,
    );
    const browser = await puppeteer.launch({
      args: ['--disable-setuid-sandbox', '--no-sandbox'],
      executablePath:
        this.configService.get('NODE_ENV') === 'production'
          ? this.configService.get('PUPPETEER_EXECUTABLE_PATH')
          : puppeteer.executablePath(),
    });
    try {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'x-puppeteer-secret': this.configService.get(
          'PUPPETEER_SECRET',
        ) as string,
      });

      const response = await page.goto(
        `${this.configService.get('PUPPETEER_ACCESS_ROUTE')}/templates/${applicationId}/${template}`,
        {
          waitUntil: 'networkidle2',
          timeout: 30_000,
        },
      );
      if (!response || response?.status() !== 200) {
        throw new Error(
          `Failed to load page, status code ${response?.status()}`,
        );
      }

      // Ensure all images are loaded
      const imageHandles = await page.$$('img');
      for (const imageHandle of imageHandles) {
        const isLoaded = await this.isImageLoaded(page, imageHandle);
        if (!isLoaded) {
          throw new Error('One or more images failed to load');
        }
      }

      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
      const pdfBuffer = Buffer.from(pdf.buffer);
      return { generatedPDF: pdfBuffer };
    } catch (e) {
      this.logger.error('Error with generating pdf', e);
      return { error: 'Error with generating pdf' };
    } finally {
      await browser.close();
    }
  }
}
