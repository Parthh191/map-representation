'use client';
import { useState } from 'react';
import { geocodeAddress } from '@/utils/geocoding';
import * as XLSX from 'xlsx';

interface RawPersonData {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  [key: string]: string | undefined; // Allow for dynamic keys from CSV/Excel
}

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

interface ValidationResult {
  valid: RawPersonData[];
  invalid: RawPersonData[];
  validationErrors: string[];
}

// Helper function to validate raw data
const processRawData = (data: RawPersonData[]): ValidationResult => {
  const valid: RawPersonData[] = [];
  const invalid: RawPersonData[] = [];
  const validationErrors: string[] = [];

  data.forEach((item) => {
    if (item.city || item.country) {
      valid.push(item);
    } else {
      invalid.push(item);
      validationErrors.push(`Missing required location data for ${item.name || 'Unknown'}`);
    }
  });

  return { valid, invalid, validationErrors };
};

export default function FileUpload({ onDataProcessed }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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

  const processValidData = async (validData: RawPersonData[]): Promise<PersonData[]> => {
    const processedResults: PersonData[] = [];
    const failedItems: RawPersonData[] = [];
    const total = validData.length;

    for (let i = 0; i < validData.length; i++) {
      const item = validData[i];
      try {
        const response = await geocodeAddress({
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
          coordinates: response
        });
      } catch {
        console.warn(`Could not process location for: ${item.name}`);
        failedItems.push(item);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    if (failedItems.length > 0) {
      console.warn(`Failed to process ${failedItems.length} items`);
    }

    return processedResults;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    
    try {
      const rawData = await parseFile(file);
      const { valid } = processRawData(rawData);

      if (valid.length === 0) {
        throw new Error('No valid data found in the file. Please check the format.');
      }

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

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}