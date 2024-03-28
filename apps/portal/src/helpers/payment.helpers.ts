import { Prisma } from '@prisma/client';

export const stringToDecimal = (decimalString: string): number => {
  return parseFloat(parseFloat(decimalString).toFixed(2));
};

export const processDateString = (dateString: string): Date => {
  const parts = dateString.split(' ');
  return new Date(parts.slice(0, 2).join(' '));
};

export const processAmountRange = (
  rangeItem: Prisma.Decimal | null,
): number => {
  if (rangeItem === null) {
    return 0;
  } else {
    return parseFloat(rangeItem.toString());
  }
};
