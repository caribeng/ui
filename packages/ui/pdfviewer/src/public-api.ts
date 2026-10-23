/*
 * Public API Surface de @caribeng/ui/pdfviewer
 */
export { CbPdfViewer, type CbPdfZoom, type CbPdfRotation, type CbPdfOutlineItem, type CbPdfFormValue } from './lib/pdfviewer.component';
export {
  CbPdfEngine,
  CB_PDF_VIEWER_OPTIONS,
  provideCbPdfViewer,
  type CbPdfViewerOptions,
  type CbPdfSource,
  type CbPdfJs,
  type CbPdfDocument,
  type CbPdfPage,
} from './lib/pdf-engine';
export type { CbPdfMatch, CbPdfTextPosition } from './lib/pdf-search';
