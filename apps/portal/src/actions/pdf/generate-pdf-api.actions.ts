'use server';

type PDFResponse =
  | { success: true; generatedPDF: Buffer }
  | { success: false; error: string };

export const generatePDFFromApi = async ({
  applicationId,
  template,
}: {
  applicationId: string;
  template: string;
}): Promise<PDFResponse> => {
  const response = await fetch(
    `${process.env.PUPPETEER_API_ROUTE}/pdf?applicationId=${applicationId}&template=${template}`,
    {
      method: 'GET',
    },
  );
  if (!response.ok) {
    return {
      success: false,
      error: `Failed to generatePDF: ${response.statusText}`,
    };
  }
  const data = await response.json();
  if (
    data.generatedPDF &&
    data.generatedPDF.type === 'Buffer' &&
    Array.isArray(data.generatedPDF.data)
  ) {
    return { success: true, generatedPDF: Buffer.from(data.generatedPDF.data) };
  }
  return { success: false, error: 'Unknown error generating PDF' };
};
