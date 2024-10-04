import type React from 'react';
import { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size exceeds 2MB');
        setFileName(null);
      } else {
        setError(null);
        setFileName(file.name);
        onImageUpload(file);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-100 transition duration-300">
      <label className="flex flex-col items-center cursor-pointer">
        <ArrowUpTrayIcon className="h-12 w-12 text-gray-500 mb-2" />
        <span className="text-gray-700">Upload an image</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {fileName && <p className="text-gray-600 mt-2">{fileName}</p>}{' '}
      {error && <p className="text-red-500 mt-2">{error}</p>}{' '}
    </div>
  );
};

export default ImageUpload;
