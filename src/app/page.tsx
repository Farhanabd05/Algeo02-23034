"use client";
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

type FilePreview = {
  name: string;
  size: number;
  type: string;
  preview: string;
};

const DropZone: React.FC = () => {
  const [files, setFiles] = useState<FilePreview[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    // Map the accepted files to include additional properties for preview
    const filePreviews = acceptedFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
    }));
    setFiles(filePreviews);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }, // Restrict file types to images
    multiple: true, // Allow multiple files
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        {...getRootProps()}
        className={`w-full max-w-lg p-6 text-center border-2 border-dashed rounded-lg cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500 font-medium">Drop the files here...</p>
        ) : (
          <p className="text-gray-500 font-medium">
            Drag & drop some files here, or click to select files
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4 w-full max-w-lg">
          <h3 className="text-lg font-semibold mb-2">Uploaded Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index} className="flex items-center gap-4 mb-3">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropZone;
