'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsLoading(true);

    // Simulate network delay for smooth loading animation
    setTimeout(() => {
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
      setIsLoading(false);
    }, 300);
  };

  const handleSelect = (coordinates: [number, number]) => {
    onSelect(coordinates);
    setSuggestions([]);
    setSearchTerm('');
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative group">
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-4 pl-12 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 
                     rounded-xl text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                     transition-all duration-300 ease-in-out
                     shadow-lg shadow-gray-900/20"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-300 group-focus-within:scale-110">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute w-full mt-2 bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 
                      rounded-xl shadow-lg z-10 max-h-[60vh] overflow-auto 
                      scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {suggestions.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(item.coordinates)}
                className="w-full p-4 text-left hover:bg-gray-700/50 text-white 
                         transition-colors duration-200 ease-in-out
                         border-b border-gray-700/50 last:border-none
                         flex flex-col gap-1"
              >
                <div className="font-medium text-violet-400">{item.name}</div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {`${item.city}, ${item.country}`}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
