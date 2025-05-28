import React, { useEffect, useState } from 'react';
import { Track, TrackRecord, loadTracksData } from '@/utils/trackUtils';

interface SimilarTracksProps {
  selectedTrack: string | null;
  onTrackSelect: (track: string) => void;
}

const SimilarTracks: React.FC<SimilarTracksProps> = ({ selectedTrack, onTrackSelect }) => {
  const [similarTracks, setSimilarTracks] = useState<Track[]>([]);
  const [trackData, setTrackData] = useState<TrackRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackData = async () => {
      if (!selectedTrack) {
        setSimilarTracks([]);
        setTrackData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await loadTracksData();
        const currentTrack = data[selectedTrack];
        if (!currentTrack) {
          throw new Error('Track not found');
        }
        setTrackData(currentTrack);
        setSimilarTracks(currentTrack.recommendations);
      } catch (err) {
        console.error('Error fetching similar tracks:', err);
        setError('Failed to load similar tracks');
        setSimilarTracks([]);
        setTrackData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackData();
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

  return (
    <div className="p-4">
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        {trackData && (
          <>
            <h2 className="text-xl font-bold text-gray-900 break-words">{trackData.track_name}</h2>
            <div className="text-gray-600 mb-2 break-words">{trackData.artist_name}</div>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div className="text-gray-600">
                <div>Tempo: {Math.round(trackData.tempo)} BPM</div>
                <div>Key: {trackData.tonic} {trackData.mode}</div>
                <div>Harmony Degree: {trackData.harmony_degree.toFixed(2)}</div>
              </div>
              <div className="text-gray-600">
                <div className="break-words">Progression 1: {trackData.progression1}</div>
                <div className="break-words">Progression 2: {trackData.progression2}</div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {similarTracks.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Similar Tracks:</h3>
          {similarTracks.map((track, index) => (
            <button
              key={index}
              onClick={() => onTrackSelect(`${track.artist_name} - ${track.track_name}`)}
              className="w-full p-3 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="font-medium text-gray-900 break-words">{track.track_name}</div>
              <div className="text-sm text-gray-600 break-words">{track.artist_name}</div>
              <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-gray-500">
                <div>
                  <div>Similarity: {Math.round((1 - (track.distance || 0)) * 100)}%</div>
                  <div>Tempo: {Math.round(track.tempo)} BPM</div>
                  <div>Key: {track.tonic} {track.mode}</div>
                </div>
                <div>
                  <div>Harmony Degree: {track.harmony_degree.toFixed(2)}</div>
                  <div className="break-words">Progression 1: {track.progression1}</div>
                  <div className="break-words">Progression 2: {track.progression2}</div>
                </div>
              </div>
            </button>
          ))}
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