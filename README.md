# music-player

Simple music player app built in Node.js

## Features

- Shuffle & repeat
- Playlist drawer with track durations
- Full keyboard control
- Responsive (mobile-friendly)
- Volume control & mute
- Lyrics support

## Quick Start

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## Adding Music

Drop audio files into `public/audio/`:

```
public/
  audio/
    my-song.mp3
    another-track.wav
    cool-tune.ogg
```

Supported formats: `.mp3` `.wav` `.ogg` `.flac` `.m4a`

Refresh the page — tracks appear automatically in the playlist.

## Adding Lyrics

Drop lyrics files into `public/lyrics/`:

```
public/
  lyrics/
    my-song.lrc
    another-track.lrc
    cool-tune.lrc
```

Supported formats: `.lrc`

---

**Note: Make sure the audio file basename and lyric file basename are exactly the same or else it won't work** _(Refer below)_

```
public/
  audio/
    Glory_Song.mp3
  lyrics/
    Glory_Song.lrc   ← same basename, different folder
```

---

We supports both timed and non-timed lyrics:

### Timed

Example:
```lrc
[00:12.50]Amazing grace how sweet the sound
[00:18.30]That saved a wretch like me
```

### Non-timed

Example:
```lrc
Amazing grace how sweet the sound
That saved a wretch like me
```

## Keyboard Shortcuts

| Key     | Action         |
|---------|----------------|
| `Space` | Play / Pause   |
| `N`     | Next track     |
| `P`     | Previous track |
| `→`     | Seek +5s       |
| `←`     | Seek -5s       |
| `↑`     | Volume up      |
| `↓`     | Volume down    |

## Contributing

Contributions are welcome.

If you'd like to improve this project:

- Fork the repo
- Submit a pull request
