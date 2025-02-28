'use client';
import { useState } from 'react';
import { geocodeAddress } from '@/utils/geocoding';
import * as XLSX from 'xlsx';
import { 
  processRawData, 
  generateExcelFile, 
  type RawPersonData 
} from '@/utils/dataProcessor';

interface PersonData {
  name: string;
  city: string;
  state: string;
  country: string;
  coordinates: [number, number];
}

interface FileUploadProps {
  onDataProcessed: (data: PersonData[]) => void;
}

interface ProcessingStats {
  total: number;
  valid: number;
  invalid: number;
  processed: number;
}

export default function FileUpload({ onDataProcessed }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [processedData, setProcessedData] = useState<{
    valid: RawPersonData[];
    invalid: RawPersonData[];
  } | null>(null);

  const parseFile = async (file: File): Promise<RawPersonData[]> => {
    try {
      if (file.type === 'text/csv') {
        const text = await file.text();
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        
        return rows.slice(1).map(row => {
          const values = row.split(',');
          return headers.reduce((obj: RawPersonData, header, index) => {
            obj[header.toLowerCase()] = values[index]?.trim() || '';
            return obj;
          }, {});
        });
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json<RawPersonData>(sheet);
      }
    } catch (error) {
      console.error('File parsing error:', error);
      throw new Error('Could not parse file. Please check the format.');
    }
  };

  const processValidData = async (validData: RawPersonData[]) => {
    const processedResults: PersonData[] = [];
    const total = validData.length;

    for (let i = 0; i < validData.length; i++) {
      const item = validData[i];
      try {
        const coordinates = await geocodeAddress({
          street: item.street,
          city: item.city || '',
          state: item.state,
          country: item.country || ''
        });

        processedResults.push({
          name: item.name || 'Unknown',
          city: item.city || '',
          state: item.state || '',
          country: item.country || '',
          coordinates
        });
      } catch (error) {
        console.error(`Error processing item:`, item, error);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    return processedResults;
  };

  const downloadFile = (data: RawPersonData[], fileName: string) => {
    const blob = generateExcelFile(data, fileName);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProcessedData(null);
    
    try {
      const rawData = await parseFile(file);
      const { valid, invalid, validationErrors } = processRawData(rawData);

      setStats({
        total: rawData.length,
        valid: valid.length,
        invalid: invalid.length,
        processed: 0
      });

      if (valid.length === 0) {
        throw new Error('No valid data found in the file. Please check the format.');
      }

      setProcessedData({ valid, invalid });
      const processedData = await processValidData(valid);
      onDataProcessed(processedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error processing file');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-6 border-2 border-dashed rounded-lg border-gray-600 bg-gray-800 text-white">
        {/* Existing file input UI */}
        <div className="mb-4 text-sm text-gray-400">
          <p>Expected file format (CSV or Excel):</p>
          <p>Name, Street Address, City, State, Country</p>
          <p className="mt-1 text-xs">Example: John Doe, 123 Main St, London, UK</p>
        </div>
        
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
          disabled={isProcessing}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="p-4 bg-gray-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-violet-500 rounded-full border-t-transparent"></div>
              <span>Processing data...</span>
            </div>
            <span className="text-violet-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-violet-500 h-full rounded-full transition-all duration-300" 
                 style={{ width: `${progress}%` }}/>
          </div>
        </div>
      )}

      {/* Stats and Download Buttons */}
      {stats && processedData && (
        <div className="p-4 bg-gray-800 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400">Valid Records</div>
              <div className="text-2xl text-violet-400">{stats.valid}</div>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400">Invalid Records</div>
              <div className="text-2xl text-red-400">{stats.invalid}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => downloadFile(processedData.valid, 'valid-data.xlsx')}
              className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Download Valid Data
            </button>
            {processedData.invalid.length > 0 && (
              <button
                onClick={() => downloadFile(processedData.invalid, 'invalid-data.xlsx')}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Download Invalid Data
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
