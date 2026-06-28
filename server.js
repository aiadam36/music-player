const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API: List all audio files from /public/audio
app.get("/api/tracks", (req, res) => {
  const audioDir = path.join(__dirname, "public", "audio");

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const supportedExtensions = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];

  try {
    const files = fs.readdirSync(audioDir).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return supportedExtensions.includes(ext);
    });

    const tracks = files.map((file, index) => {
      const name = path.basename(file, path.extname(file));
      const stats = fs.statSync(path.join(audioDir, file));
      return {
        id: index + 1,
        title: formatTitle(name),
        artist: "Unknown Artist",
        album: "Unknown Album",
        src: `/audio/${file}`,
        duration: null, // Duration resolved client-side via Web Audio API
        size: stats.size,
      };
    });

    res.json({ tracks });
  } catch (err) {
    res.status(500).json({ error: "Failed to read audio directory" });
  }
});

// Serve the main app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Helper: convert filename to readable title
function formatTitle(name) {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

app.listen(PORT, () => {
  console.log(`Music Player running at http://localhost:${PORT}`);
  console.log(`   Drop .mp3 / .wav / .ogg files into public/audio/ to get started.`);
});
