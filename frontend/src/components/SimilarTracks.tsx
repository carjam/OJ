import React, { useEffect, useState } from 'react';
import { Track, getSimilarTracks, parseTrackString } from '@/utils/trackUtils';

interface SimilarTracksProps {
  selectedTrack: string | null;
  onTrackSelect: (track: string) => void;
}

const SimilarTracks: React.FC<SimilarTracksProps> = ({ selectedTrack, onTrackSelect }) => {
  const [similarTracks, setSimilarTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarTracks = async () => {
      if (!selectedTrack) {
        setSimilarTracks([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const tracks = await getSimilarTracks(selectedTrack);
        console.log('Fetched similar tracks:', tracks);
        setSimilarTracks(tracks);
      } catch (err) {
        console.error('Error fetching similar tracks:', err);
        setError('Failed to load similar tracks');
        setSimilarTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarTracks();
  }, [selectedTrack]);

  if (!selectedTrack) {
    return (
      <div className="p-4 text-center text-gray-500">
        Search and select a track to see similar songs
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const { artist, title } = parseTrackString(selectedTrack);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{artist}</p>
      </div>
      
      {similarTracks.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Similar Tracks:</h3>
          {similarTracks.map((track, index) => {
            const trackString = `${track.artist_name} - ${track.track_name}`;
            return (
              <button
                key={index}
                onClick={() => onTrackSelect(trackString)}
                className="w-full p-3 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="font-medium text-gray-900">{track.track_name}</div>
                <div className="text-sm text-gray-600">{track.artist_name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Similarity: {Math.round((1 - (track.distance || 0)) * 100)}%
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No similar tracks found
        </div>
      )}
    </div>
  );
};

export default SimilarTracks; 