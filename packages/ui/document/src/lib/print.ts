/**
 * Imprime solo un elemento de la página, con sus estilos, en un marco oculto: la
 * página no cambia y el diálogo de impresión (o «Guardar como PDF») muestra
 * únicamente ese elemento.
 */
export function cbPrintElement(element: HTMLElement, title = document.title): void {
  const doc = element.ownerDocument;
  const frame = doc.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  doc.body.appendChild(frame);
  const w = frame.contentWindow;
  if (!w) {
    frame.remove();
    return;
  }
  // Se copian las hojas de estilo (incluidas las de los componentes) y los tokens del tema.
  const styles = Array.from(doc.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((n) => n.outerHTML)
    .join('');
  const root = doc.documentElement;
  const attrs = Array.from(root.attributes)
    .map((a) => `${a.name}="${a.value.replace(/"/g, '&quot;')}"`)
    .join(' ');
  w.document.open();
  w.document.write(
    // La base es la de la página: así las hojas enlazadas con ruta relativa se encuentran.
    `<!doctype html><html ${attrs}><head><meta charset="utf-8"><base href="${doc.baseURI.replace(/"/g, '&quot;')}"><title>${title.replace(/</g, '&lt;')}</title>${styles}` +
      '<style>@page{margin:14mm}body{margin:0;background:#fff}.cb-print-root{box-shadow:none!important;border:0!important;max-width:none!important}</style>' +
      `</head><body>${element.outerHTML.replace('class="', 'class="cb-print-root ')}</body></html>`,
  );
  w.document.close();
  const go = () => {
    w.focus();
    w.print();
    setTimeout(() => frame.remove(), 1000);
  };
  // Espera a que carguen las hojas enlazadas (fuentes y estilos) antes de imprimir.
  if (w.document.readyState === 'complete') setTimeout(go, 50);
  else w.addEventListener('load', go, { once: true });
}
