import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile, Operation } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getPromptForOperation = (operation: Operation, options?: any): string => {
  switch (operation) {
    case Operation.RemoveBackground:
      return "Remove the background of this image, leaving only the main subject. The new background must be transparent.";
    case Operation.ResizeCanvas:
      const { width, height } = options || {};
      return `Resize the canvas of this image to ${width || 1024}x${height || 1024} pixels. If the original image is smaller, add transparent padding around it to fill the canvas. If it is larger, do not crop, but scale it down to fit within the new dimensions, preserving aspect ratio, and add transparent padding if necessary.`;
    case Operation.ConvertFormat:
      const { format } = options || { format: 'png' };
      return `Convert this image to ${format.toUpperCase()} format.`;
    case Operation.Compress:
      return "Compress this image to reduce its file size as much as possible while maintaining good visual quality.";
    case Operation.AutoEnhance:
      return "Automatically enhance this image to improve its colors, lighting, and sharpness in a balanced way.";
    case Operation.Adjust:
      const { brightness, contrast, saturation } = options || {};
      let adjustmentPrompt = 'Adjust this image with the following settings: ';
      const adjustments = [];
      if (brightness) adjustments.push(`brightness by ${brightness}%`);
      if (contrast) adjustments.push(`contrast by ${contrast}%`);
      if (saturation) adjustments.push(`saturation by ${saturation}%`);
      if (adjustments.length === 0) return "Make no changes to the image.";
      adjustmentPrompt += adjustments.join(', ') + '.';
      return adjustmentPrompt;
    case Operation.Rotate:
      const { degrees } = options || {};
      return `Rotate this image by ${degrees || 90} degrees. Preserve the original canvas size and fill empty areas with transparency.`;
    case Operation.Flip:
      const { direction } = options || {};
      return `Flip this image ${direction || 'horizontally'}.`;
    case Operation.CustomPrompt:
        const { prompt } = options || {};
        return prompt || "Make no changes to the image.";
    default:
      const _exhaustiveCheck: never = operation;
      throw new Error(`Unknown operation: ${_exhaustiveCheck}`);
  }
};

export const processImage = async (
  image: ImageFile,
  operation: Operation,
  options?: any
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  const prompt = getPromptForOperation(operation, options);

  const imagePart = {
    inlineData: {
      data: image.base64,
      mimeType: image.mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    
    throw new Error('No image data found in the API response.');
  } catch (error) {
    console.error(`Error processing image with Gemini for operation ${operation}:`, error);
    throw new Error('API call to Gemini failed.');
  }
};
