'use client';
import { useState } from 'react';

interface SearchBarProps {
  data: Array<{
    name: string;
    city: string;
    country: string;
    coordinates: [number, number];
  }>;
  onSelect: (coordinates: [number, number]) => void;
}

export default function SearchBar({ data, onSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<typeof data>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 1) {
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.city.toLowerCase().includes(term.toLowerCase()) ||
        item.country.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (coordinates: [number, number]) => {
    onSelect(coordinates);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, city, or country..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <span className="absolute right-3 top-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
          {suggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(item.coordinates)}
              className="w-full p-3 text-left hover:bg-gray-600 text-white border-b border-gray-600 last:border-none"
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-400">{`${item.city}, ${item.country}`}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
