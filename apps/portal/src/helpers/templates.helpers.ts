'use server';
import QRCode from 'qrcode';

export type QRreturn = { error: string } | string;
export const generateQR = async (link: string): Promise<QRreturn> => {
  try {
    return await QRCode.toDataURL(link);
  } catch (e) {
    console.error('There was an error with generating this QR Code: ', e);
    return { error: 'There was an error generating the QR Code' };
  }
};
