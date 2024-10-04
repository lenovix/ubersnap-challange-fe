import type React from 'react';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/solid';

interface UndoRedoButtonsProps {
  currentStep: number;
  historyLength: number;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onDownload: () => void;
}

const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
  currentStep,
  historyLength,
  onUndo,
  onRedo,
  onReset,
  onDownload,
}) => {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <button
        type="button"
        onClick={onReset}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-500 text-white hover:bg-gray-700 transition duration-300"
        title="Reset"
      >
        <ArrowPathIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onUndo}
        disabled={currentStep === 0}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition duration-300 ${
          currentStep === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-700'
        }`}
        title="Undo"
      >
        <ArrowUturnLeftIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={currentStep === historyLength - 1}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition duration-300 ${
          currentStep === historyLength - 1
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-700'
        }`}
        title="Redo"
      >
        <ArrowUturnRightIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onDownload}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-700 transition duration-300"
        title="Download"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default UndoRedoButtons;
