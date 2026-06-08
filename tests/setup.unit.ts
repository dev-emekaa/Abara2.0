import "@testing-library/jest-dom";

/**
 * jsdom doesn't implement these, and Framer Motion / Radix-style components
 * touch them. Stub so component tests don't crash.
 */
if (typeof window !== "undefined") {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

  // Framer Motion uses scrollTo on refs in some paths.
  Element.prototype.scrollTo = Element.prototype.scrollTo || (() => {});
}
