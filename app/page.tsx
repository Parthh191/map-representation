'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/FileUpload';
import SearchBar from '@/components/SearchBar';
import StatsPanel from '@/components/StatsPanel';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-800/50 animate-pulse rounded-xl" />,
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
    <main className="min-h-[calc(100vh-96px)] bg-gradient-to-b from-gray-900 via-gray-800/50 to-gray-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Address Map Visualization
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Upload your data and visualize locations on an interactive map
          </p>
        </div>

        {mapData.length === 0 ? (
          <div className="card p-4 sm:p-6 lg:p-8">
            <FileUpload onDataProcessed={setMapData} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-4 sm:gap-6">
            {/* Left Panel */}
            <div className="card p-4 sm:p-6">
              <button
                onClick={() => setMapData([])}
                className="button-primary w-full mb-4"
              >
                Upload New File
              </button>
              <SearchBar data={mapData} onSelect={setSelectedLocation} />
            </div>

            {/* Map */}
            <div className="card h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
              <Map data={mapData} selectedLocation={selectedLocation} />
            </div>

            {/* Stats Panel */}
            <div className="card p-4 sm:p-6">
              <StatsPanel data={mapData} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
