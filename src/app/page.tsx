'use client';
import type React from 'react';

import ImageUpload from './components/ImageUpload';
import ImageProcessor from './components/ImageProcessor';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Home: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessComplete = (image: string) => {
    setProcessedImage(image);
  };

  const handleCloseImage = () => {
    setUploadedImage(null);
    setProcessedImage(null);
  };

  return (
    <div className="container mx-auto h-screen flex flex-col justify-center">
      <div className="flex justify-center mb-6">
        {!uploadedImage && (
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        )}
      </div>

      <div className="flex justify-center mb-6">
        {uploadedImage && (
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg relative">
            <ImageProcessor
              imageSrc={uploadedImage}
              onProcessComplete={handleProcessComplete}
            />
            <button
              type="button"
              onClick={handleCloseImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700 transition duration-300"
              title="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
