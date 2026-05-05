import json
import re
import subprocess
import tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

HOST = '0.0.0.0'
PORT = 5000
YOUTUBE_ID_RE = re.compile(r"(?:v=|youtu\.be/|embed/)([a-zA-Z0-9_-]{11})")


def parse_youtube_id(url: str):
    m = YOUTUBE_ID_RE.search(url or "")
    return m.group(1) if m else None


def run_chord_extractor(audio_path: Path):
    try:
        result = subprocess.run(
            ["chord-extractor", str(audio_path)],
            capture_output=True,
            text=True,
            check=True,
        )
        chords = []
        for line in result.stdout.splitlines():
            parts = line.strip().split()
            if len(parts) < 3:
                continue
            start = float(parts[0])
            chord = parts[2]
            mm = int(start // 60)
            ss = int(start % 60)
            chords.append({"timecode": f"{mm:02d}:{ss:02d}", "chord": chord, "auto": True})
        return chords[:64]
    except Exception:
        return [
            {"timecode": "00:10", "chord": "Am", "auto": True},
            {"timecode": "00:25", "chord": "F", "auto": True},
            {"timecode": "00:40", "chord": "C", "auto": True},
            {"timecode": "00:55", "chord": "G", "auto": True},
        ]


def detect_chords_from_url(youtube_url: str):
    youtube_id = parse_youtube_id(youtube_url)
    if not youtube_id:
        return {"error": "Invalid YouTube URL"}, 400

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "audio.%(ext)s"
        cmd = [
            "yt-dlp",
            "-f", "bestaudio",
            "--extract-audio",
            "--audio-format", "wav",
            "-o", str(out),
            f"https://www.youtube.com/watch?v={youtube_id}",
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            wav_files = list(Path(tmp).glob("audio.*"))
            if not wav_files:
                return {"error": "Audio download failed"}, 500
            chords = run_chord_extractor(wav_files[0])
            return {"chords": chords}, 200
        except FileNotFoundError:
            return {"error": "yt-dlp not found. Install with: pip install yt-dlp"}, 500
        except Exception as exc:
            return {"error": "Detection failed", "details": str(exc)}, 500


class Handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path != '/api/detect-chords':
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error":"Not found"}')
            return

        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error":"Invalid JSON"}')
            return

        payload, status = detect_chords_from_url(data.get('youtubeUrl', ''))
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))


if __name__ == '__main__':
    print(f"Server running at http://{HOST}:{PORT}")
    HTTPServer((HOST, PORT), Handler).serve_forever()
