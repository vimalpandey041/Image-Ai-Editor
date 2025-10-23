
import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PreviewArea } from './components/PreviewArea';
import { UploadArea } from './components/UploadArea';
import { ImageFile, Operation } from './types';
import { processImage } from './services/geminiService';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [processedImage, setProcessedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeOperation, setActiveOperation] = useState<Operation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: ImageFile) => {
    setOriginalImage(file);
    setProcessedImage(null); // Reset processed image on new upload
    setError(null);
  };

  const handleOperation = useCallback(async (operation: Operation, options?: any) => {
    const sourceImage = processedImage || originalImage;
    if (!sourceImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setActiveOperation(operation);
    setError(null);

    try {
      const result = await processImage(sourceImage, operation, options);
      
      // Determine new file name and mime type
      let newName = sourceImage.name.split('.').slice(0, -1).join('.') + `_${operation.toLowerCase()}`;
      let newMimeType = sourceImage.mimeType;

      if(operation === Operation.ConvertFormat && options?.format) {
        const ext = options.format.toLowerCase();
        newName += `.${ext}`;
        newMimeType = `image/${ext}`;
      } else {
        const originalExt = sourceImage.name.split('.').pop() || 'png';
        newName += `.${originalExt}`;
      }

      setProcessedImage({
        base64: result,
        mimeType: newMimeType,
        name: newName,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to process the image. Please try again.');
    } finally {
      setIsLoading(false);
      setActiveOperation(null);
    }
  }, [originalImage, processedImage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 border-b border-gray-200 bg-white">
        <div className="container mx-auto flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Image <span className="text-primary font-light">AI Editor</span>
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          <div className="lg:col-span-4">
            <ControlPanel
              onOperation={handleOperation}
              isLoading={isLoading}
              activeOperation={activeOperation}
              hasImage={!!originalImage}
              processedImage={processedImage}
            />
          </div>
          <div className="lg:col-span-8">
            {originalImage ? (
              <PreviewArea
                originalImage={originalImage}
                processedImage={processedImage}
                isLoading={isLoading}
              />
            ) : (
              <UploadArea onImageUpload={handleImageUpload} />
            )}
          </div>
        </div>
        {error && (
           <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
