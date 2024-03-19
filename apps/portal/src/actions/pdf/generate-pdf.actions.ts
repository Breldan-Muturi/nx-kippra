"use server";

import puppeteer, { Browser, PuppeteerLaunchOptions } from "puppeteer";

export const generatePDF = async (
  path: string,
): Promise<{
  error?: string;
  generatedPDF?: Buffer;
}> => {
  let browser: Browser | null = null;
  const launchOptions: PuppeteerLaunchOptions = {};
  if (process.env.NODE_ENV === "production") {
    launchOptions.args = [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ];
    launchOptions.headless = false;
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  try {
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "x-puppeteer-secret": process.env.PUPPETTER_SECRET as string,
    });
    const response = await page.goto(
      `${process.env.NEXT_PUBLIC_APP_URL}/${path}`,
      {
        waitUntil: "networkidle2",
        timeout: 20000,
      },
    );
    if (!response || response?.status() !== 200) {
      throw new Error(`Failed to load page, status code ${response?.status()}`);
    }
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    browser = null; // Ensure to set as null to prevent memory leaks

    const pdfBuffer = Buffer.from(pdf.buffer);
    return { generatedPDF: pdfBuffer };
  } catch (error) {
    console.log("Error uploading the form: ", error);
    const message = error as string;
    if (browser !== null) {
      await browser.close(); // Ensure to close the browser in case of an error
    }
    return { error: message ?? "There is an error" };
  }
};
