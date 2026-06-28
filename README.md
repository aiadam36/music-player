# music-player

Simple music player app built in Node.js

## Features

- Shuffle & repeat
- Playlist drawer with track durations
- Full keyboard control
- Responsive (mobile-friendly)
- Volume control & mute

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
