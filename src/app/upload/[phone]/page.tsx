'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DocumentUploadPage({
  params
}: {
  params: { phone: string }
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<string>('');
  const [uploadedFileData, setUploadedFileData] = useState<{ fileName: string, fileSize: number } | null>(null);

  const decodedPhone = decodeURIComponent(params.phone);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('phone', decodedPhone); // optional context for backend
    formData.append('serviceType', serviceType);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setToken(data.token);
      setUploadedFileData({ fileName: data.fileName, fileSize: data.fileSize });
    } catch (err) {
      console.error('Upload Error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 selection:bg-blue-100">
      
      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-700 mb-8 tracking-tight">SUVIDHA 2026</h1>

      {/* Main Card */}
      <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {!token ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Secure Document Upload</h2>
              <p className="text-sm text-gray-500 mt-1">Your file is encrypted and auto-deleted after 48 hours.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-6">
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select service type (optional)</option>
                <option value="electricity">⚡ Electricity Bill</option>
                <option value="gas">🔥 Gas Bill</option>
                <option value="water">💧 Water / Municipal</option>
                <option value="complaint">📋 Complaint Evidence</option>
              </select>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
                ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*, application/pdf, .doc, .docx"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-blue-500" />
                </div>
                <span className="font-semibold text-gray-700">
                  {file ? file.name : 'Choose file or drag here'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Supports Image, PDF, DOC (max 5MB)
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed
                           text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
              >
                {uploading ? 'Encrypting & Uploading...' : 'Upload Securely'}
              </button>
              
              {file && !uploading && (
                <button
                  onClick={() => setFile(null)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
            <p className="text-gray-500 mb-8">Show this token at the kiosk</p>
            
            <div className="bg-gray-100 p-6 rounded-xl inline-block mb-2">
              <span className="text-4xl font-mono font-bold tracking-widest text-gray-900">
                {token}
              </span>
            </div>
            {uploadedFileData && (
              <p className="text-sm text-gray-500 mt-2">
                File saved: {uploadedFileData.fileName} ({(uploadedFileData.fileSize / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-400 max-w-sm space-y-1">
        <p>🔒 End-to-end encrypted | Auto-deleted in 48 hours | DPDP Act 2023 compliant</p>
      </div>

    </div>
  );
}
