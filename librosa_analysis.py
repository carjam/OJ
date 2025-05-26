# Append Audio Information to df
#
### librosa: https://librosa.org/doc/latest/index.html
### (McFee, Brian, Colin Raffel, Dawen Liang, Daniel PW Ellis, Matt McVicar, Eric Battenberg, and Oriol Nieto.
### “librosa: Audio and music signal analysis in python.” In Proceedings of the 14th python in science conference, pp. 18-25. 2015.)

import librosa
import numpy as np
import concurrent.futures
from time import time
import traceback
from concurrent.futures import ProcessPoolExecutor

import json
import pandas as pd
import re
import os

### To make this run as stand-alone .py script for performance ###
### Load the playlist into df ###


def sanitize_filename(filename):
    # Remove characters not allowed in filenames (Windows, macOS, Linux)
    return re.sub(r'[\\/*?:"<>|]', '', filename)

""" Degree of Harmony
    1.0–1.5 → monophonic (no harmony, single note per time).
    2.0–3.0 → likely vocal harmonies or chords (e.g., duets, backing vocals).
    3.0 → rich harmonic content (dense vocals, synths, or polyphonic instruments).
"""
def detectDegreeOfHarmony(chroma):
    threshold = 0.5 * chroma.max(axis=0) # Define a threshold as a fraction of the maximum chroma energy
    strong = (chroma >= threshold)
    return np.mean(strong.sum(axis=0))


# Krumhansl-Schmuckler key profiles
major_profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
minor_profile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
# Rotate profiles to each of the 12 keys
profiles, key_names = [], []
# Major keys
for i in range(12):
    profiles.append(np.roll(major_profile, i))
    key_names.append(librosa.midi_to_note(60 + i, octave=False) + ' major')
# Minor keys
for i in range(12):
    profiles.append(np.roll(minor_profile, i))
    key_names.append(librosa.midi_to_note(60 + i, octave=False) + ' minor')
# end


def analyze_song(args):
    index, row, mp3_dir = args
    try:
        artist = row['artist_name']
        track = row['track_name']
        safe_name = f"{artist} - {track}.mp3".replace("/", "-").replace(":", "-")
        song_file = os.path.join(mp3_dir, safe_name) #mp3_dir + '/' + safe_name
    
        if not os.path.exists(song_file):
            return -1, None  # Mark as skipped

        result = {}
    
        y, sr = librosa.load(song_file)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    
        # Harmony
        result['harmony_degree'] = detectDegreeOfHarmony(chroma)
    
        # Key estimation
        chroma_mean = np.mean(chroma, axis=1)
        correlations = [np.corrcoef(chroma_mean, profile)[0, 1] for profile in profiles]
        best_index = np.argmax(correlations)
    
        estimated_key = key_names[best_index]
        key_str = estimated_key.replace("♯", "#").replace("♭", "b")  # Change this to your key
        tonic, mode = key_str.split()
        result['tonic'] = tonic
        result['mode'] = mode


        # Tempo
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr)
        result['tempo'] = float(np.squeeze(tempo))
    
        # MFCC
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        result['mfcc_shape'] = str(mfccs.shape)
    
        # Spectral features
        spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        result['spectral_contrast_mean'] = np.mean(spectral_contrast)
        result['spectral_contrast_var'] = np.std(spectral_contrast)
    
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        result['spectral_centroid_mean'] = np.mean(spectral_centroid)
        result['spectral_centroid_var'] = np.std(spectral_centroid)
    
        spectral_flatness = librosa.feature.spectral_flatness(y=y)
        result['spectral_flatness_mean'] = np.mean(spectral_flatness)
        result['spectral_flatness_var'] = np.std(spectral_flatness)
    
        return index, result
    except Exception as e:
        print(f"Error processing {index}: {e}")
        traceback.print_exc()
        return -1, None



# Load JSON from file ############################
#working_dir = 'C:/Users/carja/Documents/Capstone/'
working_dir = '/mnt/c/Users/carja/Documents/Capstone/'
with open(working_dir + 'playlist_data3.json', encoding='utf-8') as f:
    playlists  = json.load(f)

# Flattened track list
track_rows = []

for playlist in playlists:
    # Extract playlist metadata (everything except the track list)
    playlist_metadata = {k: v for k, v in playlist.items() if k != '0'}
    
    # Extract the track list (the key "0" holds the tracks)
    tracks = playlist.get("0", [])
    
    for track in tracks:
        # Combine track data with playlist metadata
        combined = {**track, **playlist_metadata}
        track_rows.append(combined)

# Convert to DataFrame
df = pd.DataFrame(track_rows)
# Rename playlist fields to make it clear
playlist_fields = ['name', 'pid', 'num_tracks', 'num_albums', 'num_artists', 'num_followers', 'collaborative']
df.rename(columns={field: f'playlist_{field}' for field in playlist_fields}, inplace=True)
# first remove duplicate tracks to avoid downloading twice
df = df.drop_duplicates(subset=['artist_name', 'track_name'])
############################


# Loop over your DataFrame rows
mp3_dir = working_dir + 'downloads'
results = []

chunk_size = 100  # Adjust based on memory, speed, etc.
total = len(df)
MAX_WORKERS = os.cpu_count() - 1  # Use all cores except one for stability
for start in range(0, total, chunk_size):
    end = min(start + chunk_size, total)
    batch = df.iloc[start:end]

    tasks = [(idx, row, mp3_dir) for idx, row in batch.iterrows()]
    print(f"\n🔹 Processing chunk {start}–{end}...")

    # Timing each chunk
    t0 = time()
    with concurrent.futures.ProcessPoolExecutor(max_workers=MAX_WORKERS) as executor:
        try:
            futures = list(executor.map(analyze_song, tasks))
        except Exception as e:
            print(f"Error processing batch: {e}")
    t1 = time()

    # Collect results
    chunk_results = [res for res in futures if res is not None and res[0] >= 0]
    results.extend(chunk_results)

    print(f"⏱️ Completed in {t1 - t0:.2f} seconds. Saving checkpoint...")

    # Save intermediate result
    partial_df = pd.DataFrame([r[1] for r in chunk_results], index=[r[0] for r in chunk_results])
    partial_df.sort_index(inplace=True)
    checkpoint_file = os.path.join(working_dir, f'checkpoint_{start}_{end}.csv')
    partial_df.to_csv(checkpoint_file)

# Final save
if results:
    final_df = pd.DataFrame([r[1] for r in results], index=[r[0] for r in results])
    final_df = df.join(final_df, how='left')
    final_df.to_csv(os.path.join(working_dir, 'initialAnalysis.csv'), index=False)

print("✅ All chunks processed and saved.")
