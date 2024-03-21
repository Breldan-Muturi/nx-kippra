export class SuccessPdfDto {
  readonly success: true;
  readonly generatedPDF: Buffer;
}

export class ErrorPdfDto {
  readonly success: false;
  readonly error: string;
}
