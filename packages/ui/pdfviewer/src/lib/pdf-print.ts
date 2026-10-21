import type { CbPdfDocument } from './pdf-engine';

/** Resolución de impresión (ppp). */
const PRINT_DPI = 150;

/**
 * Imprime el documento: rasteriza cada página a {@link PRINT_DPI} ppp en un
 * `<iframe>` oculto y abre el diálogo de impresión del navegador (así se
 * imprime el PDF y no la página de la aplicación).
 */
export async function printPdfDocument(
  pdf: CbPdfDocument,
  document: Document,
  onProgress: (done: number, total: number) => void,
  rotation = 0,
): Promise<void> {
  const urls: string[] = [];
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  try {
    let pageSize = '';
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: PRINT_DPI / 72, rotation: (page.rotate + rotation) % 360 });
      if (n === 1) pageSize = `${Math.round((viewport.width * 72) / PRINT_DPI)}pt ${Math.round((viewport.height * 72) / PRINT_DPI)}pt`;
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      await page.render({ canvas, viewport, intent: 'print' }).promise;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) urls.push(URL.createObjectURL(blob));
      canvas.width = canvas.height = 0;
      page.cleanup();
      onProgress(n, pdf.numPages);
    }

    document.body.append(frame);
    const doc = frame.contentDocument!;
    doc.open();
    doc.write(
      `<!doctype html><html><head><style>@page{size:${pageSize};margin:0}html,body{margin:0}` +
        `img{display:block;width:100%;height:auto;break-after:page}img:last-child{break-after:auto}</style></head><body></body></html>`,
    );
    doc.close();
    await Promise.all(
      urls.map((src) => {
        const img = doc.createElement('img');
        img.src = src;
        img.alt = '';
        doc.body.append(img);
        return img.decode().catch(() => undefined);
      }),
    );
    const win = frame.contentWindow!;
    await new Promise<void>((resolve) => {
      win.addEventListener('afterprint', () => resolve(), { once: true });
      win.focus();
      win.print();
      // Red de seguridad por si el navegador no emite afterprint.
      setTimeout(resolve, 60_000);
    });
  } finally {
    frame.remove();
    for (const url of urls) URL.revokeObjectURL(url);
  }
}
