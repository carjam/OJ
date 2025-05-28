import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the JSON data file instead of pickle
    const dataPath = path.join(process.cwd(), 'public', 'track_recommendation_data.json')
    console.log('Attempting to read recommendation data from:', dataPath)
    
    if (!fs.existsSync(dataPath)) {
      console.error('JSON file not found at:', dataPath)
      return NextResponse.json(
        { error: 'Recommendation data file not found' },
        { status: 404 }
      )
    }

    // Read and parse the JSON data
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    
    // Return the data as JSON
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error serving recommendation data:', error)
    return NextResponse.json(
      { error: 'Failed to serve recommendation data' },
      { status: 500 }
    )
  }
} 