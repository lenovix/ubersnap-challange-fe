import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Cropper } from 'react-cropper';
import { ScissorsIcon } from '@heroicons/react/24/solid';
import UndoRedoButtons from './UndoRedoButtons';
import 'cropperjs/dist/cropper.css';

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
  const cropperRef = useRef<HTMLImageElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.cv) {
      console.log('OpenCV Loaded');
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
    const imgElement = imgRef.current as HTMLImageElement;
    if (!imgElement) return;

    const src = cv.imread(imgElement);
    const dst = new cv.Mat();

    switch (effect) {
      case 'grayscale':
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        break;

      case 'sepia': {
        const sepiaKernel = cv.matFromArray(
          4,
          4,
          cv.CV_32F,
          [
            0.272, 0.534, 0.131, 0.0, 0.349, 0.686, 0.168, 0.0, 0.393, 0.769,
            0.189, 0.0, 0.0, 0.0, 0.0, 1.0,
          ]
        );
        cv.transform(src, dst, sepiaKernel);
        break;
      }

      default:
        break;
    }

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
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      updateHistory(croppedImage);
      setIsCropping(false);

      const outputCanvas = document.getElementById(
        'outputCanvas'
      ) as HTMLCanvasElement;
      const ctx = outputCanvas.getContext('2d');
      const img = new Image();
      img.src = croppedImage;
      img.onload = () => {
        outputCanvas.width = img.width;
        outputCanvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
      };
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
              ref={cropperRef}
              viewMode={1}
              responsive={true}
              zoomable={true}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={handleCrop}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
              >
                Apply Crop
              </button>
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center space-x-2 mt-4">
        <button
          type="button"
          onClick={() => applyEffect('grayscale')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300"
        >
          Grayscale
        </button>
        <button
          type="button"
          onClick={() => applyEffect('sepia')}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300"
        >
          Sepia
        </button>

        <button
          type="button"
          onClick={() => setIsCropping(true)}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
        >
          <ScissorsIcon className="h-5 w-5 mr-2" />
          Crop
        </button>
      </div>
    </div>
  );
};

export default ImageProcessor;
