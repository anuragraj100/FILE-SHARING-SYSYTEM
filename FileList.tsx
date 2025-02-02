import React, { useEffect, useState } from 'react';
import { Download, Trash2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  created_at: string;
}

export function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    fetchFiles();
    const subscription = supabase
      .channel('files')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, fetchFiles)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchFiles() {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      return;
    }

    setFiles(data || []);
  }

  async function downloadFile(path: string, fileName: string) {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  }

  async function deleteFile(id: string, path: string) {
    try {
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .match({ id });

      if (dbError) throw dbError;

      toast.success('File deleted successfully');
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }

  async function copyShareLink(path: string) {
    try {
      const { data } = await supabase.storage
        .from('files')
        .createSignedUrl(path, 60 * 60); // 1 hour expiry

      if (data?.signedUrl) {
        await navigator.clipboard.writeText(data.signedUrl);
        toast.success('Share link copied to clipboard');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Files</h2>
      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyShareLink(file.path)}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Copy share link"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => downloadFile(file.path, file.name)}
                className="p-2 text-gray-500 hover:text-green-500 transition-colors"
                title="Download file"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteFile(file.id, file.path)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Delete file"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <p className="text-center text-gray-500 py-8">No files uploaded yet</p>
        )}
      </div>
    </div>
  );
}