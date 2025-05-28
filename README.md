
# Music Similarity Search

A web application for finding similar music tracks based on audio features.

## Features

- Fast, responsive search with auto-complete
- Display similar tracks based on audio features
- Interactive UI for exploring track relationships
- Efficient data handling with debounced search


## Development

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

## Data Files

The application expects the following data files in the `frontend/public` directory:
- `analyzedTracks.csv`: Contains track information and audio features
- `knn_data.json`: Contains pre-computed similarity indices and distances

## Architecture

- Frontend: Next.js with TypeScript
- UI Components: React with Tailwind CSS
- Search: Optimized with debouncing and memoization
- Containerization: Docker with multi-stage builds

## License

[Your chosen license]
