# Guitar Sync Rehearsal (V0)

## 1) Lancer l'UI
```bash
python -m http.server 8000
# ouvrir http://localhost:8000
```

## 2) Lancer le backend auto-chords (sans Flask)
```bash
pip install -r requirements.txt
python server.py
```

Le backend est volontairement en **stdlib Python** (`http.server`) pour éviter l'erreur `ModuleNotFoundError: flask`.

## Endpoint
- `POST http://localhost:5000/api/detect-chords`
- Body JSON:
```json
{ "youtubeUrl": "https://www.youtube.com/watch?v=XXXXXXXXXXX" }
```

## Détection réelle
- Audio récupéré avec `yt-dlp`.
- Si `chord-extractor` est installé: extraction réelle des accords.
- Sinon: fallback V0 (Am / F / C / G) pour garder l'app utilisable.
