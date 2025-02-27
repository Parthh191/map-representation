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
    <main className="min-h-[calc(100vh-96px)] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Address Map Visualization
          </h1>
          <p className="text-gray-400 text-lg">
            Upload your data and visualize locations on an interactive map
          </p>
        </div>

        {mapData.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-700/50">
            <FileUpload onDataProcessed={setMapData} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
            {/* Left Panel - Search */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700/50">
                <button
                  onClick={() => setMapData([])}
                  className="w-full mb-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                >
                  Upload New File
                </button>
                <SearchBar data={mapData} onSelect={setSelectedLocation} />
              </div>
            </div>

            {/* Center - Map */}
            <div className="h-[700px] rounded-2xl overflow-hidden shadow-lg border border-gray-700/50">
              <Map data={mapData} selectedLocation={selectedLocation} />
            </div>

            {/* Right Panel - Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700/50">
              <StatsPanel data={mapData} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
