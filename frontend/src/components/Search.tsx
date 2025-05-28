import React, { useState, useEffect } from 'react';
import { searchTracks, loadTracksData } from '@/utils/trackUtils';

interface SearchProps {
  onTrackSelect: (track: string) => void;
}

const Search: React.FC<SearchProps> = ({ onTrackSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{track_name: string, artist_name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchTracksList = async () => {
      if (query.trim()) {
        try {
          const data = await loadTracksData();
          const searchResults = Object.entries(data)
            .filter(([_, track]) => 
              track.track_name.toLowerCase().includes(query.toLowerCase()) ||
              track.artist_name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 10)
            .map(([_, track]) => ({
              track_name: track.track_name,
              artist_name: track.artist_name
            }));
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

  const handleSelect = (track: {track_name: string, artist_name: string}) => {
    onTrackSelect(`${track.artist_name} - ${track.track_name}`);
    setQuery('');
    setResults([]);
  };

  const handleRandomTrack = async () => {
    setLoading(true);
    try {
      const data = await loadTracksData();
      const tracks = Object.values(data);
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      handleSelect({
        track_name: randomTrack.track_name,
        artist_name: randomTrack.artist_name
      });
    } catch (error) {
      console.error('Error getting random track:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a track..."
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {results.map((track, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(track)}
                  className="w-full p-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="font-medium text-gray-900 break-words">{track.track_name}</div>
                  <div className="text-sm text-gray-600 break-words">{track.artist_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleRandomTrack}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white whitespace-nowrap ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          } transition-colors duration-200`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Random'
          )}
        </button>
      </div>
    </div>
  );
};

export default Search; 