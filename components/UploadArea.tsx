
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImageFile } from '../types';
import { UploadIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { Spinner } from './Spinner';

interface UploadAreaProps {
  onImageUpload: (file: ImageFile) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file.');
      setUploadState('error');
      timerRef.current = window.setTimeout(() => setUploadState('idle'), 3000);
      return;
    }

    setUploadState('uploading');
    setErrorMessage('');

    try {
      const base64 = await fileToBase64(file);
      setUploadState('success');
      timerRef.current = window.setTimeout(() => {
        onImageUpload({ base64, mimeType: file.type, name: file.name });
      }, 1000);
    } catch (error) {
      console.error("File reading error:", error);
      setErrorMessage('Could not read the provided file.');
      setUploadState('error');
      timerRef.current = window.setTimeout(() => {
        setUploadState('idle');
        setErrorMessage('');
      }, 3000);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadState === 'idle') setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const borderClass = isDragging ? 'border-primary' : 'border-gray-300';

  const renderContent = () => {
    switch (uploadState) {
      case 'uploading':
        return (
          <div className="text-center space-y-4" aria-live="polite">
            <Spinner large />
            <p className="text-lg font-semibold text-gray-700">Processing Image...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center space-y-4 text-green-600" aria-live="polite">
            <CheckCircleIcon className="mx-auto h-12 w-12" />
            <p className="text-lg font-semibold">Upload Successful!</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center space-y-4 text-red-600" aria-live="polite">
            <XCircleIcon className="mx-auto h-12 w-12" />
            <p className="text-lg font-semibold">Upload Failed</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
        );
      default:
        return (
          <div className="text-center space-y-4">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-lg font-semibold text-gray-700">Drag & Drop your image here</p>
            <p className="text-medium">or</p>
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Select File
            </label>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
          </div>
        );
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative flex flex-col items-center justify-center w-full h-full min-h-[400px] p-8 bg-white rounded-xl border-2 border-dashed ${borderClass} transition-colors duration-300`}
    >
      {renderContent()}
    </div>
  );
};
