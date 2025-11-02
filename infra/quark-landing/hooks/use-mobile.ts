import * as React from "react";
// SSR-проверка для window

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`) 
      : null;
    const onChange = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    };
    if (mql !== null) {
      mql.addEventListener("change", onChange);
    }
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    return () => {
      if (mql !== null) {
        mql.removeEventListener("change", onChange);
      }
    };
  }, []);

  return !!isMobile;
}
