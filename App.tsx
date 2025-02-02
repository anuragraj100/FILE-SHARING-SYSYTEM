import React from 'react';
import { Toaster } from 'react-hot-toast';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { FolderOpen } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <FolderOpen className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">File Sharing System</h1>
          <p className="mt-2 text-gray-600">
            Upload, share, and manage your files securely
          </p>
        </div>

        <FileUpload />
        <FileList />
      </div>
    </div>
  );
}

export default App;