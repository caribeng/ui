/*
 * Public API Surface de @caribeng/ui/qrcode
 */
export { CbQrcode } from './lib/qrcode.component';
export {
  cbQrEncode,
  cbQrFormatBits,
  cbQrReedSolomon,
  CB_QR_ERROR_CORRECTION_LEVELS,
  type CbQrEncodeOptions,
  type CbQrErrorCorrection,
  type CbQrMatrix,
} from './lib/qr-encoder';
