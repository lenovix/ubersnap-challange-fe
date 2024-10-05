import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Cropper } from 'react-cropper';
import { ScissorsIcon } from '@heroicons/react/24/solid';
import UndoRedoButtons from './UndoRedoButtons';
import 'cropperjs/dist/cropper.css';

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    cv: any;
  }
}

interface ImageProcessorProps {
  imageSrc: string;
  onProcessComplete: (processedImage: string) => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({
  imageSrc,
  onProcessComplete,
}) => {
  const [history, setHistory] = useState<string[]>([imageSrc]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const cropperRef = useRef<Cropper | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!window.cv) {
      console.error('OpenCV belum di-load');
    }
  }, []);

  const updateHistory = (newImage: string) => {
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push(newImage);
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
    onProcessComplete(newImage);

    const outputCanvas = document.getElementById(
      'outputCanvas'
    ) as HTMLCanvasElement;
    const ctx = outputCanvas.getContext('2d');
    const img = new Image();
    img.src = newImage;
    img.onload = () => {
      outputCanvas.width = img.width;
      outputCanvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
    };
  };

  const applyEffect = (effect: 'grayscale' | 'sepia') => {
    const imgElement = imgRef.current;
    if (!imgElement || !window.cv) return;
    // @ts-ignore
    const src = cv.imread(imgElement);
    // @ts-ignore
    const dst = new cv.Mat();

    switch (effect) {
      case 'grayscale':
        // @ts-ignore
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        break;

      case 'sepia': {
        // @ts-ignore
        const sepiaKernel = cv.matFromArray(
          4,
          4,
          // @ts-ignore
          cv.CV_32F,
          [
            0.272, 0.534, 0.131, 0.0, 0.349, 0.686, 0.168, 0.0, 0.393, 0.769,
            0.189, 0.0, 0.0, 0.0, 0.0, 1.0,
          ]
        );
        // @ts-ignore
        cv.transform(src, dst, sepiaKernel);
        break;
      }

      default:
        break;
    }

    // @ts-ignore
    cv.imshow('outputCanvas', dst);
    const outputCanvas = document.getElementById(
      'outputCanvas'
    ) as HTMLCanvasElement;
    const dataUrl = outputCanvas.toDataURL();
    updateHistory(dataUrl);

    src.delete();
    dst.delete();
  };

  const handleCrop = () => {
    // @ts-ignore
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      updateHistory(croppedImage);
      setIsCropping(false);
    }
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onProcessComplete(history[currentStep - 1]);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
      onProcessComplete(history[currentStep + 1]);
    }
  };

  const handleReset = () => {
    setHistory([imageSrc]);
    setCurrentStep(0);
    onProcessComplete(imageSrc);
  };

  const handleDownload = () => {
    const outputCanvas = document.getElementById(
      'outputCanvas'
    ) as HTMLCanvasElement;
    const ctx = outputCanvas.getContext('2d');
    const currentImage = history[currentStep];

    if (!outputCanvas || !ctx || !currentImage) {
      console.error('Canvas or current image is not available');
      return;
    }

    const img = new Image();
    img.src = currentImage;
    img.onload = () => {
      outputCanvas.width = img.width;
      outputCanvas.height = img.height;

      ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
      ctx.drawImage(img, 0, 0);

      const dataUrl = outputCanvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'processed-image.png';
      link.click();
    };
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY;

    if (delta < 0) {
      setZoom((prevZoom) => prevZoom + 0.1);
    } else {
      setZoom((prevZoom) => Math.max(1, prevZoom - 0.1));
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <UndoRedoButtons
        currentStep={currentStep}
        historyLength={history.length}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onDownload={handleDownload}
      />

      <div
        className="w-full max-w-lg border-2 border-gray-300 p-4 rounded-lg shadow-lg bg-white"
        style={{ maxHeight: '100vh', overflow: 'hidden' }}
        onWheel={handleWheel}
      >
        {!isCropping && (
          <img
            ref={imgRef}
            src={history[currentStep]}
            alt="Processed"
            className="rounded"
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.3s',
            }}
          />
        )}
        <canvas id="outputCanvas" style={{ display: 'none' }} />

        {isCropping && (
          <div className="relative">
            <Cropper
              src={history[currentStep]}
              style={{ height: 'auto', width: '100%' }}
              initialAspectRatio={1}
              guides={false}
              // @ts-ignore
              ref={cropperRef}
              viewMode={1}
              responsive={true}
              zoomable={true}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={handleCrop}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-6">
        <button
          type="button"
          onClick={() => applyEffect('grayscale')}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
        >
          Grayscale
        </button>

        <button
          type="button"
          onClick={() => applyEffect('sepia')}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
        >
          Sepia
        </button>

        <button
          type="button"
          onClick={() => setIsCropping(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <ScissorsIcon className="w-5 h-5 mr-2" />
          Crop
        </button>
      </div>
    </div>
  );
};

export default ImageProcessor;
