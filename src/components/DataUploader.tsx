import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseDataFile } from '@/utils/dataParser';
import { TrafficHotspot, DatasetInfo } from '@/types/traffic';

interface DataUploaderProps {
  onDataLoaded: (hotspots: TrafficHotspot[], info: DatasetInfo) => void;
  datasetInfo: DatasetInfo | null;
  onClearData: () => void;
}

export const DataUploader = ({ onDataLoaded, datasetInfo, onClearData }: DataUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const content = await file.text();
      const hotspots = parseDataFile(content, file.name);
      
      // Extract date range from data
      const lines = content.split('\n');
      const dates = lines.slice(1, Math.min(100, lines.length))
        .map(line => line.split(',')[0])
        .filter(Boolean)
        .sort();
      
      const dateRange = dates.length > 0 
        ? `${dates[0]} - ${dates[dates.length - 1]}`
        : 'Unknown';

      const info: DatasetInfo = {
        filename: file.name,
        rowCount: lines.length - 1,
        dateRange,
        uploadedAt: new Date(),
      };

      onDataLoaded(hotspots, info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.json'))) {
      processFile(file);
    } else {
      setError('Please upload a CSV or JSON file');
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  if (datasetInfo) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-traffic-clear/20">
              <Database className="w-5 h-5 text-traffic-clear" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{datasetInfo.filename}</span>
                <Check className="w-4 h-4 text-traffic-clear" />
              </div>
              <p className="text-xs text-muted-foreground">
                {datasetInfo.rowCount.toLocaleString()} records • {datasetInfo.dateRange}
              </p>
            </div>
          </div>
          <button
            onClick={onClearData}
            className="p-2 rounded-lg bg-secondary hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 text-center',
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/30',
          isProcessing && 'pointer-events-none opacity-50'
        )}
      >
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center gap-3">
          {isProcessing ? (
            <>
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Processing dataset...</p>
            </>
          ) : (
            <>
              <div className={cn(
                'p-3 rounded-xl transition-colors',
                isDragging ? 'bg-primary/20' : 'bg-secondary'
              )}>
                {isDragging ? (
                  <Upload className="w-6 h-6 text-primary" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isDragging ? 'Drop your dataset here' : 'Upload ML Dataset'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag & drop CSV or JSON, or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};
