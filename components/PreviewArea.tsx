
import React from 'react';
import { ImageFile } from '../types';
import { Spinner } from './Spinner';

interface PreviewAreaProps {
  originalImage: ImageFile;
  processedImage: ImageFile | null;
  isLoading: boolean;
}

const ImageBox: React.FC<{ title: string; image: ImageFile | null; isLoading?: boolean }> = ({ title, image, isLoading = false }) => (
  <div className="flex-1 flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">{title}</h3>
    <div className="w-full h-full aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <Spinner large />
        </div>
      )}
      {image ? (
        <img
          src={`data:${image.mimeType};base64,${image.base64}`}
          alt={title}
          className="object-contain w-full h-full"
        />
      ) : (
        <p className="text-gray-400">Your image will appear here</p>
      )}
    </div>
  </div>
);

export const PreviewArea: React.FC<PreviewAreaProps> = ({ originalImage, processedImage, isLoading }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 h-full">
      <ImageBox title="Before" image={originalImage} />
      <ImageBox title="After" image={processedImage} isLoading={isLoading} />
    </div>
  );
};
