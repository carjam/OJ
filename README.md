# OJ
Like The O'Jays, "I Love Music, Any kind of music."
https://en.wikipedia.org/wiki/I_Love_Music_(The_O%27Jays_song)

Instead of relying on genre, let's use raw sound.

Genres have long been used to artificially divide music.
I'm hoping to find my own taste with the help of signal processing, music theory, and statistics.

These scripts will download Spotify & Youtube playlists into JSON.
Using the playlist, it'll analyze the sound.
It'll then figure out what combination of features most uniquely identifies a song.
It'll find the cosine distance between them.
It'll find the optimal number of related songs to establish a clear separation between song types.
It'll then provide the list of the related songs for any song in the list.

This could be used for:
- Listeners: Exploring music and finding songs that match your tastes.
- Songwriters: Finding the timbre, mode, tonic, and progression trends of music an audience prefers.
- Patent Trolls: Finding songs that are 'just too similar,' and might be plagarism.
