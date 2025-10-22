import React, { useState, useCallback, useEffect } from 'react';
import { UploadedFile } from '../types';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploaderProps {
  id: string;
  title: string;
  description: string;
  multiple: boolean;
  onFilesChange: (files: UploadedFile[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, multiple, onFilesChange }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Fix: Explicitly type 'file' as 'File' to resolve TypeScript inference issue.
      const newFiles = Array.from(event.target.files).map((file: File) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      if (multiple) {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
      } else {
        setFiles(newFiles.slice(0, 1));
      }
    }
  }, [multiple]);

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const removedFile = newFiles.splice(index, 1)[0];
      URL.revokeObjectURL(removedFile.preview);
      return newFiles;
    });
  };

  useEffect(() => {
    onFilesChange(files);
    // Cleanup object URLs on unmount
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);
  
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col">
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      
      <div className="flex-grow flex flex-col">
        <label htmlFor={id} className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          </div>
          <input id={id} type="file" className="hidden" multiple={multiple} accept="image/*" onChange={handleFileChange} />
        </label>
        
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2 flex-grow overflow-y-auto pr-1" style={{maxHeight: '15rem'}}>
            {files.map((uploadedFile, index) => (
              <div key={index} className="relative group aspect-square">
                <img src={uploadedFile.preview} alt={`preview ${index}`} className="w-full h-full object-cover rounded-md" />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-600/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;