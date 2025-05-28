'use client'

import { useState, useEffect } from 'react'
import Search, { Track } from '@/components/Search'
import SimilarTracks from '@/components/SimilarTracks'
import { loadTracks, findNearestNeighbors } from '@/utils/trackUtils'

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [similarTracks, setSimilarTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true)
        setError(null)
        const loadedTracks = await loadTracks()
        setTracks(loadedTracks)
      } catch (err) {
        console.error('Error fetching tracks:', err)
        setError(err instanceof Error ? err.message : 'Failed to load tracks')
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
  }, [])

  const handleTrackSelect = (track: Track | null) => {
    if (!track) {
      setSelectedTrack(null)
      setSimilarTracks([])
      return
    }
    
    setSelectedTrack(track)
    try {
      const similar = findNearestNeighbors(track.id, tracks)
      setSimilarTracks(similar)
    } catch (error) {
      console.error('Error finding similar tracks:', error)
      setSimilarTracks([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Tracks</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Music Similarity Search
          </h1>
          <p className="text-gray-600">
            Search for a track to find similar songs based on audio features
          </p>
        </div>

        <div className="flex justify-center">
          <Search tracks={tracks} onTrackSelect={handleTrackSelect} />
        </div>

        <SimilarTracks
          selectedTrack={selectedTrack}
          similarTracks={similarTracks}
          onTrackClick={handleTrackSelect}
        />
      </div>
    </main>
  )
}
