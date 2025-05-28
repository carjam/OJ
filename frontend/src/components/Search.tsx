import React, { useState, useEffect } from 'react';
import { searchTracks, parseTrackString } from '@/utils/trackUtils';

interface SearchProps {
  onTrackSelect: (track: string) => void;
}

const Search: React.FC<SearchProps> = ({ onTrackSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    const searchTracksList = async () => {
      if (query.trim()) {
        try {
          const searchResults = await searchTracks(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Error searching tracks:', error);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    };

    const timeoutId = setTimeout(searchTracksList, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (track: string) => {
    onTrackSelect(track);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a track..."
          className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {results.map((track, index) => {
              const { artist, title } = parseTrackString(track);
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(track)}
                  className="w-full p-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="font-medium">{title}</div>
                  <div className="text-sm text-gray-600">{artist}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 