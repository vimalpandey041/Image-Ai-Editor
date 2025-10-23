export enum Operation {
  RemoveBackground = 'REMOVE_BACKGROUND',
  ResizeCanvas = 'RESIZE_CANVAS',
  ConvertFormat = 'CONVERT_FORMAT',
  Compress = 'COMPRESS',
  // New
  AutoEnhance = 'AUTO_ENHANCE',
  Adjust = 'ADJUST',
  Rotate = 'ROTATE',
  Flip = 'FLIP',
  CustomPrompt = 'CUSTOM_PROMPT',
}

export type ImageFile = {
  base64: string;
  mimeType: string;
  name: string;
};
