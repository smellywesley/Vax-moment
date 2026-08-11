export function focusPageHeading(headingId = 'page-heading'): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const heading = document.getElementById(headingId);
  if (!(heading instanceof HTMLElement)) {
    return false;
  }

  if (!heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1');
  }
  heading.focus({ preventScroll: false });
  return document.activeElement === heading;
}
