# Music Similarity Search

Genres artificially divide music. Instead of genre, let's use raw sound to relate songs.


## Features
- Playlist retrieval
- Audio data retrieval
- Unsupervised learning approach using signal processing, music theory, and machine learning to offer similar song suggestions.
- Fast, responsive search with auto-complete
- Display similar tracks based on audio features
- Interactive UI for exploring track relationships
- Efficient data handling with debounced search

## Potential Usage
- Listeners: Exploring music and finding songs that match your tastes
- Songwriters: Finding the timbre, mode, tonic, and progression trends of music an audience prefers
- DJs: Find songs that blend well in a set
- Mash-ups: Make a new song by combining of bunch that fit together naturally
- Patent Trolls: Finding songs that are 'just too similar,' and might be plagarism


## Development
### Data Pre-Processing
1. First prepare your playlist in the format of playlist_data3.json.  You can use the helper tools in PreProcessing.ipynb to download from Spotify or Youtube.
2. Run the appropriate cells in PreProcessing.ipynb "Ingest the Playlist and Begin Analysis"
3. Continue running consecutive cells until "Analyze With Librosa."  This cell is time consuming so an alternative is available, "libros_analysis.py"
4. Continue running cells thereafter until the end of the notebook.
5. Open Comparison.ipynb and run the cells top to bottom to build the model, produce the similarity matrix, and output the data.  The Front End (see below) will use this output data as its input.


### Front End
To run the application in development mode:

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the application at `http://localhost:3000`

### Data Files

The application expects the following data files in the `frontend/public` directory:
- `grouped_recommendations.json`: Contains track information w/ matches & audio features. Produced by Comparison.ipynb

### Architecture

- Frontend: Next.js with TypeScript
- UI Components: React with Tailwind CSS
- Search: Optimized with debouncing and memoization
- Containerization: Docker with multi-stage builds

