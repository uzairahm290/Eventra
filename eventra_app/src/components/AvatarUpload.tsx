import React, { useState, useCallback, useRef } from 'react';
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface AvatarUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ value, onChange }) => {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return;
    }
    setError(null);
    setFile(f);
    const blobUrl = URL.createObjectURL(f);
    setPreview(blobUrl);
  };

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragActive(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragActive(false); }, []);
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

  const uploadToServer = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/Upload/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Upload failed');
      }

      const { url } = await res.json() as { url: string };
      onChange?.(url);
      setPreview(url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition group ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onClick={triggerSelect}
      >
        {!preview && (
          <div className="text-center space-y-2">
            <FiUploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-primary-500" />
            <p className="text-sm text-gray-500">Drag &amp; drop or click to select</p>
            <p className="text-xs text-gray-400">PNG, JPG up to 5 MB</p>
          </div>
        )}
        {preview && (
          <div className="relative">
            <img src={preview} alt="avatar preview" className="h-32 w-32 object-cover rounded-full ring-4 ring-white shadow-md" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); clearImage(); }}
              className="absolute -top-2 -right-2 bg-white text-gray-600 rounded-full p-1 shadow hover:bg-red-50"
              aria-label="Remove image"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button type="button" onClick={triggerSelect} className="btn-secondary flex items-center gap-1.5 text-sm">
          <FiImage className="h-4 w-4" /> Choose
        </button>
        <button
          type="button"
          disabled={!file || uploading}
          onClick={uploadToServer}
          className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </>
          ) : (
            <><FiUploadCloud className="h-4 w-4" /> Upload</>
          )}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default AvatarUpload;
