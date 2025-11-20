import React, { useState, useCallback, useRef } from 'react';
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi';

interface AvatarUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ value, onChange }) => {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  // client-only storage; no uploading state needed
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setError(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const triggerSelect = () => inputRef.current?.click();

  const clearImage = () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(undefined);
    setFile(null);
    setError(null);
  };

  const persistLocally = async () => {
    if (!file) return;
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      onChange?.(dataUrl);
      setPreview(dataUrl);
      // Optional: store in localStorage for demo persistence
      try { localStorage.setItem('eventra:avatar', dataUrl); } catch {}
    } catch (err: any) {
      setError(err.message || 'Could not process image');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Profile Image</label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition group ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400'}`}
        onClick={triggerSelect}
      >
        {!preview && (
          <div className="text-center space-y-2">
            <FiUploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-indigo-500" />
            <p className="text-sm text-gray-500">Drag & drop or click to select</p>
            <p className="text-xs text-gray-400">PNG, JPG up to ~2MB</p>
          </div>
        )}
        {preview && (
          <div className="relative">
            <img src={preview} alt="avatar preview" className="h-32 w-32 object-cover rounded-full ring-4 ring-white shadow-md" />
            <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full p-1 shadow hover:bg-red-50" aria-label="Remove image">
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button type="button" onClick={triggerSelect} className="btn-secondary flex items-center">
          <FiImage className="mr-2" /> Choose
        </button>
        <button type="button" disabled={!file} onClick={persistLocally} className="btn-primary flex items-center disabled:opacity-50">
          <FiUploadCloud className="mr-2" /> Save Locally
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default AvatarUpload;
