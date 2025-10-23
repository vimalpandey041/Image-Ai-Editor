import React, { useState } from 'react';
import { ImageFile, Operation } from '../types';
import { 
  BackgroundIcon, CompressIcon, ConvertIcon, DownloadIcon, ResizeIcon, 
  MagicWandIcon, SlidersIcon, RotateCcwIcon, FlipIcon, SparklesIcon, ChevronDownIcon
} from './icons';
import { Spinner } from './Spinner';

interface ControlPanelProps {
  onOperation: (operation: Operation, options?: any) => void;
  isLoading: boolean;
  activeOperation: Operation | null;
  hasImage: boolean;
  processedImage: ImageFile | null;
}

const AccordionItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 text-primary">{icon}</span>
          <span className="font-medium text-gray-700">{title}</span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};


export const ControlPanel: React.FC<ControlPanelProps> = ({ onOperation, isLoading, activeOperation, hasImage, processedImage }) => {
  // State for controls
  const [width, setWidth] = useState<number>(1024);
  const [height, setHeight] = useState<number>(1024);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('png');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = `data:${processedImage.mimeType};base64,${processedImage.base64}`;
    link.download = processedImage.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const isDisabled = isLoading || !hasImage;

  const AdjustmentSlider: React.FC<{label: string, value: number, onChange: (v: number) => void}> = ({ label, value, onChange }) => (
    <div>
      <label className="flex justify-between text-sm font-medium text-gray-600">
        <span>{label}</span>
        <span>{value}</span>
      </label>
      <input 
        type="range" min="-50" max="50" value={value} 
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        disabled={isDisabled}
      />
    </div>
  );
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Editing Tools</h2>
      <div className="space-y-4 flex-grow">

        <AccordionItem title="Quick Actions" icon={<MagicWandIcon />} defaultOpen>
          <button onClick={() => onOperation(Operation.AutoEnhance)} disabled={isDisabled} className="w-full text-sm py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Auto Enhance</button>
          <button onClick={() => onOperation(Operation.RemoveBackground)} disabled={isDisabled} className="w-full text-sm py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Remove Background</button>
          <button onClick={() => onOperation(Operation.Compress)} disabled={isDisabled} className="w-full text-sm py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Compress Image</button>
        </AccordionItem>

        <AccordionItem title="Transform" icon={<ResizeIcon />}>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onOperation(Operation.Rotate, {degrees: -90})} disabled={isDisabled} className="text-sm py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Rotate Left</button>
            <button onClick={() => onOperation(Operation.Rotate, {degrees: 90})} disabled={isDisabled} className="text-sm py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Rotate Right</button>
            <button onClick={() => onOperation(Operation.Flip, {direction: 'horizontally'})} disabled={isDisabled} className="text-sm py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Flip Horizontal</button>
            <button onClick={() => onOperation(Operation.Flip, {direction: 'vertically'})} disabled={isDisabled} className="text-sm py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Flip Vertical</button>
          </div>
          <hr className="my-4"/>
          <label className="font-medium text-gray-700 text-sm">Set Canvas Size</label>
          <div className="flex gap-2 mt-2">
            <input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value, 10))} className="w-full p-2 border rounded-md text-white bg-gray-800" placeholder="Width"/>
            <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value, 10))} className="w-full p-2 border rounded-md text-white bg-gray-800" placeholder="Height"/>
          </div>
          <button onClick={() => onOperation(Operation.ResizeCanvas, { width, height })} disabled={isDisabled} className="w-full text-sm mt-2 py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Apply Resize</button>
        </AccordionItem>

        <AccordionItem title="Adjustments" icon={<SlidersIcon />}>
           <AdjustmentSlider label="Brightness" value={brightness} onChange={setBrightness} />
           <AdjustmentSlider label="Contrast" value={contrast} onChange={setContrast} />
           <AdjustmentSlider label="Saturation" value={saturation} onChange={setSaturation} />
           <button onClick={() => onOperation(Operation.Adjust, {brightness, contrast, saturation})} disabled={isDisabled} className="w-full text-sm mt-2 py-2 px-4 rounded-md bg-primary-light text-primary hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">Apply Adjustments</button>
        </AccordionItem>

        <AccordionItem title="AI Creative Tools" icon={<SparklesIcon />}>
            <label className="font-medium text-gray-700 text-sm">Custom Prompt</label>
            <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} className="w-full p-2 mt-2 border rounded-md text-white bg-gray-800" placeholder="e.g., 'make this black and white', 'add a cat wearing a hat'" rows={3} disabled={isDisabled}/>
            <button onClick={() => onOperation(Operation.CustomPrompt, {prompt: customPrompt})} disabled={isDisabled || !customPrompt} className="w-full text-sm mt-2 py-2 px-4 rounded-md bg-primary-light text-primary hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">Generate with AI</button>
        </AccordionItem>

        <AccordionItem title="Export Settings" icon={<ConvertIcon />}>
            <label className="font-medium text-gray-700 text-sm">Convert Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as any)} className="w-full p-2 border rounded-md mt-2 text-white bg-gray-800" disabled={isDisabled}>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WEBP</option>
            </select>
            <button onClick={() => onOperation(Operation.ConvertFormat, { format })} disabled={isDisabled} className="w-full text-sm mt-2 py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">Apply Convert</button>
        </AccordionItem>

      </div>

      <div className="mt-8">
        <button
          onClick={handleDownload}
          disabled={!processedImage}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <DownloadIcon className="w-5 h-5" />
          Download Image
        </button>
      </div>
    </div>
  );
};
