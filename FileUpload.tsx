import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export function FileUpload() {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        const { data, error } = await supabase.storage
          .from('files')
          .upload(`${Date.now()}-${file.name}`, file);

        if (error) throw error;

        // Create a record in the files table
        const { error: dbError } = await supabase.from('files').insert({
          name: file.name,
          size: file.size,
          type: file.type,
          path: data.path,
          created_at: new Date().toISOString(),
        });

        if (dbError) throw dbError;

        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      {isDragActive ? (
        <p className="text-blue-500">Drop the files here...</p>
      ) : (
        <div>
          <p className="text-gray-600">Drag & drop files here, or click to select files</p>
          <p className="text-sm text-gray-500 mt-2">Upload any file type</p>
        </div>
      )}
    </div>
  );
}