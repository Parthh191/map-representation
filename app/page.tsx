'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/FileUpload';
import SearchBar from '@/components/SearchBar';
import StatsPanel from '@/components/StatsPanel';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse" />,
});

interface MapDataItem {
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
}

export default function Home() {
  const [mapData, setMapData] = useState<MapDataItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <header className="text-center sm:text-left space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
            Address Map Visualization
          </h1>
          <p className="text-gray-400 text-lg">
            Upload your data and visualize locations on an interactive map
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <FileUpload onDataProcessed={setMapData} />
            </div>
            
            {mapData.length > 0 && (
              <>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4 text-violet-300">Search Locations</h2>
                  <SearchBar data={mapData} onSelect={setSelectedLocation} />
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <StatsPanel data={mapData} />
                </div>
              </>
            )}
          </div>

          <div className="h-[600px] sm:h-[700px] rounded-xl overflow-hidden shadow-lg">
            {mapData.length > 0 ? (
              <Map data={mapData} selectedLocation={selectedLocation} />
            ) : (
              <div className="h-full bg-gray-800/50 backdrop-blur-sm flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-lg font-medium">Upload a file to view the map</p>
                <p className="text-sm mt-2">Supported formats: CSV, Excel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
