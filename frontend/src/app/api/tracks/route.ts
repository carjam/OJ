import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the CSV data from the public directory
    const csvPath = path.join(process.cwd(), 'public', 'analyzedTracks.csv')
    console.log('Attempting to read CSV from:', csvPath)
    
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found at:', csvPath)
      return NextResponse.json(
        { error: 'Track data file not found' },
        { status: 404 }
      )
    }

    console.log('CSV file found, reading contents...')
    const csvData = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvData.split('\n')
    console.log('Number of lines in CSV:', lines.length)
    
    const headers = lines[0].split(',')
    console.log('CSV headers:', headers)
    
    // Find the indices of required columns
    const trackNameIndex = headers.findIndex(h => h.trim().toLowerCase() === 'track_name')
    const artistNameIndex = headers.findIndex(h => h.trim().toLowerCase() === 'artist_name')
    
    console.log('Track name column index:', trackNameIndex)
    console.log('Artist name column index:', artistNameIndex)
    
    if (trackNameIndex === -1 || artistNameIndex === -1) {
      console.error('Required columns not found in CSV')
      return NextResponse.json(
        { error: 'Invalid CSV format - missing required columns' },
        { status: 500 }
      )
    }

    // Parse the CSV data, skipping the header row
    const tracks = lines.slice(1)
      .filter(line => line.trim() !== '') // Skip empty lines
      .map((line, index) => {
        const columns = line.split(',')
        const title = columns[trackNameIndex]?.trim()
        const artist = columns[artistNameIndex]?.trim()
        
        // Skip entries with missing title or artist
        if (!title || !artist) {
          console.log('Skipping track with missing data:', { title, artist })
          return null
        }

        return {
          id: index.toString(),
          title,
          artist
        }
      })
      .filter(track => track !== null) // Remove null entries

    console.log('Number of valid tracks parsed:', tracks.length)
    console.log('Sample track:', tracks[0])

    if (tracks.length === 0) {
      console.error('No valid tracks found in CSV data')
      return NextResponse.json(
        { error: 'No valid tracks found in data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error('Error loading track data:', error)
    return NextResponse.json(
      { error: 'Failed to load track data' },
      { status: 500 }
    )
  }
} 