# Guitar Sync Rehearsal (V0)

## Lancer l'UI
```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Lancer la détection auto des accords (backend Python)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
```

L'UI appelle `POST http://localhost:5000/api/detect-chords` quand tu cliques sur **Détecter depuis vidéo**.

### Détection réelle
- Le backend télécharge l'audio YouTube via `yt-dlp`.
- Si la CLI `chord-extractor` est installée, elle est utilisée pour extraire des accords.
- Sinon fallback sur une progression V0 par défaut (Am / F / C / G).
