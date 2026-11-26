import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function FileUpload({ folder = 'general', onUploadSuccess, accept, label = 'Upload File' }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState('');
  const inputRef = useRef(null);
  const { error: toastError } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toastError('File size must be under 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    setUploading(true);
    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const result = res.data.data;
      setUploadedName(file.name);
      if (onUploadSuccess) onUploadSuccess(result, file);
    } catch (err) {
      toastError(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 transition"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {uploading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-brand-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
        </div>
      ) : uploadedName ? (
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" /> {uploadedName} (Click to replace)
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-sm text-slate-500">
          <Upload className="h-5 w-5 text-slate-400" />
          <span className="font-medium text-slate-700">{label}</span>
          <span className="text-xs text-slate-400">Max 10MB (PDF, PNG, JPG, ZIP, DOCX)</span>
        </div>
      )}
    </div>
  );
}
