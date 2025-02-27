'use client';
import { useState } from 'react';
import { geocodeAddress } from '@/utils/geocoding';
import * as XLSX from 'xlsx';

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

type RowData = string[];

const validateRow = (row: unknown[]): row is RowData => {
  if (!Array.isArray(row)) return false;
  if (row.length === 0) return false;
  
  // Convert all values to strings and trim them
  const cleanRow = row.map(item => 
    item === null || item === undefined ? '' : String(item).trim()
  );
  
  // Check if we have at least a name and some address information
  return cleanRow.some(cell => cell.length > 0);
};

export default function FileUpload({ onDataProcessed }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const parseFile = async (file: File): Promise<RowData[]> => {
    try {
      if (file.type === 'text/csv') {
        const text = await file.text();
        // Handle different line endings and split by comma or semicolon
        const rows = text
          .replace(/\r\n/g, '\n')
          .split('\n')
          .filter(row => row.trim())
          .map(row => row.split(/[,;]/).map(cell => cell.trim()));
        
        console.log('Parsed CSV rows:', rows); // Debug log
        return rows;
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<string[]>(sheet, { 
          header: 1,
          defval: '' // Use empty string for empty cells
        });
        
        console.log('Parsed Excel rows:', data); // Debug log
        return data;
      }
    } catch (error) {
      console.error('File parsing error:', error);
      throw new Error('Could not parse file. Please check the format.');
    }
  };

  const processInBatches = async (rows: RowData[], batchSize = 5) => {
    const processedData: PersonData[] = [];
    const totalRows = rows.length - 1; // Excluding header row
    
    for (let i = 1; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const batchPromises = batch.map(async (row) => {
        try {
          if (!row || row.length < 3) return null;

          const [name, street, city, country] = row.map(cell => 
            cell ? cell.trim() : ''
          );

          if (!city || !country) {
            console.log('Skipping row due to missing city/country:', row);
            return null;
          }

          const coordinates = await geocodeAddress({
            street,
            city,
            country
          });
          
          return {
            name: name || 'Unknown',
            city,
            state: '',
            country,
            coordinates,
          };
        } catch (error) {
          console.error(`Error processing row:`, row, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter((result): result is PersonData => 
        result !== null
      );
      processedData.push(...validResults);

      // Update progress
      const currentProgress = Math.round((Math.min(i + batchSize, rows.length) / totalRows) * 100);
      setProgress(currentProgress);
    }

    return processedData;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    
    try {
      const rows = await parseFile(file);
      const processedData = await processInBatches(rows);

      if (processedData.length === 0) {
        throw new Error('No locations could be found. Please check the addresses in your file.');
      }

      onDataProcessed(processedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error processing file');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-6 border-2 border-dashed rounded-lg border-gray-600 bg-gray-800 text-white">
      <div className="mb-4 text-sm text-gray-400">
        <p>Expected CSV format:</p>
        <p>Name, Street Address, City, Country, Job Title</p>
        <p className="mt-1 text-xs">Example: John Doe, 123 Main St, London, UK, Engineer</p>
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
      {isProcessing && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-violet-500 rounded-full border-t-transparent"></div>
              <p>Processing data...</p>
            </div>
            <span className="text-violet-400 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-violet-500 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
}
