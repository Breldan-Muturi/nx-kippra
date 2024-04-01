export const processSearchString = (search: string): string => {
  return search
    .split(' ')
    .filter((word) => word.length > 0)
    .join(' & ');
};
