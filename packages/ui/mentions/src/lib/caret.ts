/** Propiedades que afectan a cómo se reparte el texto en líneas. */
const MIRRORED = [
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
] as const;

/**
 * Posición (px, relativa al campo) del carácter `index` de un textarea o
 * input, con un div espejo invisible que copia su tipografía y su ancho.
 * Sirve para abrir el panel de sugerencias justo bajo lo que se escribe.
 */
export function cbCaretCoordinates(field: HTMLTextAreaElement | HTMLInputElement, index: number): { top: number; left: number; height: number } {
  const doc = field.ownerDocument;
  const style = doc.defaultView?.getComputedStyle(field);
  const mirror = doc.createElement('div');
  const isInput = field.nodeName === 'INPUT';
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';
  mirror.style.whiteSpace = isInput ? 'nowrap' : 'pre-wrap';
  mirror.style.overflowWrap = 'break-word';
  if (style) for (const prop of MIRRORED) mirror.style[prop] = style[prop];
  mirror.textContent = field.value.slice(0, index);
  const marker = doc.createElement('span');
  marker.textContent = field.value.slice(index) || '.';
  mirror.appendChild(marker);
  doc.body.appendChild(mirror);
  const lineHeight = parseFloat(style?.lineHeight ?? '') || parseFloat(style?.fontSize ?? '') * 1.2 || 18;
  const result = {
    top: marker.offsetTop + (parseFloat(style?.borderTopWidth ?? '') || 0) - field.scrollTop,
    left: marker.offsetLeft + (parseFloat(style?.borderLeftWidth ?? '') || 0) - field.scrollLeft,
    height: lineHeight,
  };
  mirror.remove();
  return result;
}
