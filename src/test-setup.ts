// jsdom gaps used by the app
Element.prototype.scrollIntoView = () => {};
window.scrollTo = (() => {}) as typeof window.scrollTo;
window.matchMedia = ((q: string) => ({
  matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false
})) as typeof window.matchMedia;
