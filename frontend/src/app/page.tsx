'use client'

import { useState, useEffect } from 'react'
import Search from '@/components/Search'
import SimilarTracks from '@/components/SimilarTracks'
import { loadTracksData } from '@/utils/trackUtils'
import type { Track } from '@/utils/trackUtils'

export default function Home() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true)
        setError(null)
        // Just verify we can load tracks
        await loadTracksData()
        setLoading(false)
      } catch (err) {
        console.error('Error fetching tracks:', err)
        setError(err instanceof Error ? err.message : 'Failed to load tracks')
        setLoading(false)
      }
    }

    fetchTracks()
  }, [])

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrack(trackId)
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

        <div className="flex justify-center mb-8">
          <Search onTrackSelect={handleTrackSelect} />
        </div>

        <SimilarTracks
          selectedTrack={selectedTrack}
          onTrackSelect={handleTrackSelect}
        />
      </div>
    </main>
  )
}
