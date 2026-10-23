/*
 * Public API Surface de @caribeng/ui/image-cropper
 */
export { CbImageCropper, type CbCropRatio, type CbCropResult } from './lib/image-cropper.component';
export {
  clampRect,
  cropImage,
  fitRatio,
  initialRect,
  outputSize,
  previewStyle,
  readFileAsDataUrl,
  resizeRect,
  rotateImage,
  type CbCropOutput,
  type CbCropRect,
} from './lib/crop-geometry';
