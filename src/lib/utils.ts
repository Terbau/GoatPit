import { cubicOut } from 'svelte/easing';

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isValidEmail = (email: string): boolean => {
  const re = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
  return re.test(email);
}


export const generateRandomId = (): number => {
  return Math.floor(Math.random() * Date.now());
}


export function clickOutside(
  node: HTMLElement,
  handler: () => void
): { destroy: () => void } {
  const onClick = (event: MouseEvent) =>
    node &&
    !node.contains(event.target as HTMLElement) &&
    !event.defaultPrevented &&
    handler();

  document.addEventListener('click', onClick, true);

  return {
    destroy() {
      document.removeEventListener('click', onClick, true);
    },
  };
}


export const getImdbImageSize = (url: string): { width: number; height: number } => {
  const match = url.match(/_V1_QL75_UX\d+_CR0,0,(\d+),(\d+)_/);
  if (!match) return { width: 0, height: 0 };

  const width = parseInt(match[1]);
  const height = parseInt(match[2]);

  return { width, height };
}


export const transformImdbImageSize = (url: string, width?: number, height?: number): string => {
  if (!width && !height) return url;

  const { width: oldWidth, height: oldHeight } = getImdbImageSize(url);
  // if (!oldWidth || !oldHeight) return url;
  const aspectRatio = oldWidth / oldHeight;

  if (width) {
    height = Math.floor(width / aspectRatio);
  } else if (height) {
    width = Math.floor(height * aspectRatio);
  }

  const suffix = `_V1_QL75_UX${width}_CR0,0,${width},${height}_`;
  return url.replace(/_V1_QL75_UX\d+_CR0,0,\d+,\d+_/, suffix);
}


export const roundTo = (num: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}


export const decodeB64 = (str: string): string => {
  // return Buffer.from(str, 'base64').toString('utf-8');
  return atob(str);  // Needs to work in browser as well
} 


export const decodeJwtNoVerify = <Type>(token: string): Type  => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('invalid token');
  }

  const payload = parts[1];
  const decoded = decodeB64(payload);
  return JSON.parse(decoded);
}

// https://svelte.dev/repl/baf39c4e70b141409ae72bcfc503be62?version=3.37.0
export function betterSlide(node: HTMLElement, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' }) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const primary_dimension = axis === 'y' ? 'height' : 'width';
  const primary_dimension_value = parseFloat(style[primary_dimension]);
  const secondary_dimensions = axis === 'y' ? ['Top', 'Bottom'] : ['Left', 'Right'];
  const padding_start_value = parseFloat(style.padding + secondary_dimensions[0]);
  const padding_end_value = parseFloat(style.padding + secondary_dimensions[1]);
  const margin_start_value = parseFloat(style.margin + secondary_dimensions[0]);
  const margin_end_value = parseFloat(style.margin + secondary_dimensions[1]);
  const border_width_start_value = parseFloat(style[<any> `border${secondary_dimensions[0]}Width`]);
  const border_width_end_value = parseFloat(style[<any> `border${secondary_dimensions[1]}Width`]);
  return {
    delay,
    duration,
    easing,
    css: (t: number) =>
      'overflow: hidden;' +
      `opacity: ${Math.min(t * 20, 1) * opacity};` +
      `${primary_dimension}: ${t * primary_dimension_value}px;` +
      `padding-${secondary_dimensions[0].toLowerCase()}: ${t * padding_start_value}px;` +
      `padding-${secondary_dimensions[1].toLowerCase()}: ${t * padding_end_value}px;` +
      `margin-${secondary_dimensions[0].toLowerCase()}: ${t * margin_start_value}px;` +
      `margin-${secondary_dimensions[1].toLowerCase()}: ${t * margin_end_value}px;` +
      `border-${secondary_dimensions[0].toLowerCase()}-width: ${t * border_width_start_value}px;` +
      `border-${secondary_dimensions[1].toLowerCase()}-width: ${t * border_width_end_value}px;`
  };
}
