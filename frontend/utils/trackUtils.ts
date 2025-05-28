export interface Track {
  track_name: string;
  artist_name: string;
  distance?: number;
}

export interface TrackRecommendations {
  [key: string]: Track[];
}

let tracksData: TrackRecommendations | null = null;

export const loadTracksData = async (): Promise<TrackRecommendations> => {
  if (tracksData) {
    return tracksData;
  }

  try {
    const url = '/grouped_recommendations.json';
    console.log('1. Starting fetch from URL:', url);
    console.log('2. Current window.location:', window.location.href);
    
    const response = await fetch(url);
    console.log('3. Response received:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      type: response.type,
      url: response.url
    });
    
    if (!response.ok) {
      console.error('4. Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
    }
    
    console.log('5. About to parse JSON');
    const data = await response.json() as TrackRecommendations;
    console.log('6. JSON parsed successfully');
    console.log('7. Number of tracks:', Object.keys(data).length);
    
    tracksData = data;
    return data;
  } catch (error: any) {
    console.error('8. Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    throw error;
  }
};

export const getAllTracks = async (): Promise<string[]> => {
  const data = await loadTracksData();
  return Object.keys(data);
};

export const getSimilarTracks = async (trackId: string): Promise<Track[]> => {
  const data = await loadTracksData();
  return data[trackId] || [];
};

export const searchTracks = async (query: string): Promise<string[]> => {
  const data = await loadTracksData();
  const normalizedQuery = query.toLowerCase();
  
  return Object.keys(data).filter(track => 
    track.toLowerCase().includes(normalizedQuery)
  ).slice(0, 10);
};

export const parseTrackString = (trackString: string): { artist: string; title: string } => {
  const [artist, title] = trackString.split(' - ');
  return { artist: artist || '', title: title || '' };
}; 