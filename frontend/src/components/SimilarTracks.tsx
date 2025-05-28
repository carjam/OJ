import { Track } from './Search'

type SimilarTracksProps = {
  selectedTrack: Track | null
  similarTracks: Track[]
  onTrackClick?: (track: Track) => void
}

export default function SimilarTracks({
  selectedTrack,
  similarTracks,
  onTrackClick
}: SimilarTracksProps) {
  if (!selectedTrack) return null

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Selected Track</h2>
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-teal-900">
              {selectedTrack.artist} - {selectedTrack.title}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Tracks</h2>
          {similarTracks.length > 0 ? (
            <div className="space-y-3">
              {similarTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => onTrackClick?.(track)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 ease-in-out border border-gray-200 group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-teal-600">
                        {track.artist} - {track.title}
                      </p>
                    </div>
                    {track.distance !== undefined && (
                      <span className="text-sm text-gray-500">
                        Similarity: {(1 - track.distance).toFixed(2)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No similar tracks found</p>
          )}
        </div>
      </div>
    </div>
  )
} 