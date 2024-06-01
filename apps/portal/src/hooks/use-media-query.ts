import { useEffect, useState } from 'react';

const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

const useMediaQuery = (query: keyof typeof breakpoints): boolean => {
  const [matches, setMatches] = useState(false);
  const mediaQuery = breakpoints[query];

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);
    setMatches(mediaQueryList.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener('change', handler);

    return () => mediaQueryList.removeEventListener('change', handler);
  }, [mediaQuery]);

  return matches;
};

export default useMediaQuery;
