import { useState, useRef } from "react";
import { detectTrafficImage } from "../services/api";
import type { TrafficImageResponse } from "../types/traffic";
import { Upload, Loader, AlertCircle, CheckCircle, X } from "lucide-react";

interface Props {
  onResult: (data: TrafficImageResponse) => void;
}

export default function ImageUpload({ onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await detectTrafficImage(file);
      const completeResult: TrafficImageResponse = {
        vehicle_count: result.vehicle_count || 0,
        vehicle_score: result.vehicle_score || 0,
        anomaly_status: result.anomaly_status || "NORMAL",
        final_congestion_score: result.final_congestion_score || 0,
        marker_color: result.marker_color || "green",
      };
      onResult(completeResult);
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze traffic image"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-4">
      {/* File Input */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />

        {!preview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-dashed border-cyan-500/30 rounded-lg hover:border-cyan-500/60 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="text-sm">
                <p className="font-medium text-slate-200">Click to upload image</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </button>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-cyan-500/30">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            {!loading && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-300" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* File Info */}
      {file && (
        <div className="text-xs text-slate-400 px-1">
          <p>📄 {file.name}</p>
          <p>📦 {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            Analyze Traffic
          </>
        )}
      </button>

      {/* Info Text */}
      <p className="text-xs text-slate-500 text-center">
        Upload a traffic image for AI-powered congestion analysis
      </p>
    </div>
  );
}