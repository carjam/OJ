import { Track } from '@/components/Search'

type KNNData = {
  indices: number[][]
  distances: number[][]
}

let knnData: KNNData | null = null

export async function loadTracks(): Promise<Track[]> {
  try {
    console.log('Starting to load tracks...')
    
    // Load track data
    const response = await fetch('/api/tracks')
    console.log('API response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`)
    }
    
    const data = await response.json()
    console.log('API response data:', {
      trackCount: data.tracks?.length || 0,
      sampleTrack: data.tracks?.[0],
      error: data.error
    })

    if (data.error) {
      console.error('API returned error:', data.error)
      throw new Error(data.error)
    }

    if (!Array.isArray(data.tracks)) {
      console.error('API response missing tracks array')
      throw new Error('Invalid API response format')
    }

    // Load KNN data if not already loaded
    if (!knnData) {
      console.log('Loading KNN data...')
      try {
        const knnResponse = await fetch('/knn_data.json')
        console.log('KNN data response status:', knnResponse.status)
        
        if (!knnResponse.ok) {
          throw new Error(`KNN data request failed with status ${knnResponse.status}`)
        }
        
        knnData = await knnResponse.json()
        
        if (!knnData?.indices || !knnData?.distances) {
          throw new Error('Invalid KNN data format')
        }
        
        console.log('KNN data loaded:', {
          indicesLength: knnData.indices.length,
          distancesLength: knnData.distances.length
        })
      } catch (error) {
        console.error('Error loading KNN data:', error)
        // Don't throw here - we can still show tracks without KNN data
      }
    }

    return data.tracks
  } catch (error) {
    console.error('Error loading data:', error)
    throw error // Re-throw to let the component handle the error
  }
}

export function findNearestNeighbors(
  trackId: string,
  tracks: Track[],
  k: number = 5
): Track[] {
  if (!knnData) {
    console.error('KNN data not loaded')
    return []
  }

  // Find the index of the target track
  const trackIndex = parseInt(trackId)
  if (isNaN(trackIndex) || trackIndex < 0 || trackIndex >= tracks.length) {
    console.error('Invalid track index:', trackIndex)
    return []
  }

  // Get the indices and distances for the target track
  const indices = knnData.indices[trackIndex]
  const distances = knnData.distances[trackIndex]

  if (!indices || !distances) {
    console.error('No KNN data found for track index:', trackIndex)
    return []
  }

  console.log('Finding neighbors for track:', {
    trackId,
    trackIndex,
    indicesFound: indices.length,
    distancesFound: distances.length
  })

  // Map the indices to tracks with their distances
  return indices
    .slice(0, k)
    .map((neighborIndex, i) => ({
      ...tracks[neighborIndex],
      distance: distances[i],
    }))
    .filter((track) => track.id !== trackId)
} 