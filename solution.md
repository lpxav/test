# Solution produit — Répétition guitare avec YouTube, accords synchronisés et doigtés

## 1) Problème à résoudre
Un guitariste perd du temps entre plusieurs outils: YouTube pour l’audio, une note pour la grille, puis des sites séparés pour les positions d’accords.

## 2) Solution proposée (écran principal en 2 colonnes)

### Colonne gauche: YouTube + playlist
- Champ unique: **« Coller un lien YouTube »**.
- Bouton **Ajouter**.
- Liste des morceaux avec:
  - miniature + titre,
  - durée,
  - actions (lecture, renommer, supprimer, réordonner).
- Gestion multi-playlists (répète, concert, cours).

### Colonne droite: accords + doigtés
- Affichage de la grille synchronisée à la lecture.
- Deux sources d’accords:
  1. **Manuel**: saisie des accords avec timecodes.
  2. **Auto**: génération automatique proposée par le système.
- Pour chaque accord:
  - nom (Am, G, F, etc.),
  - **diagramme de position des doigts**,
  - variantes (ouvert, barré, capo, simplifié).

---

## 3) Flux utilisateur (très concret)
1. L’utilisateur colle un lien YouTube.
2. Le morceau s’ajoute à la playlist de gauche.
3. Il clique sur le morceau pour lancer la lecture.
4. À droite, il choisit:
   - soit **générer automatiquement** la grille,
   - soit **renseigner manuellement** les accords.
5. Pendant la lecture, la ligne d’accord active se surligne automatiquement.
6. En cliquant un accord, le diagramme de doigté s’affiche immédiatement.

---

## 4) Fonctionnalités clés

### A. Playlist YouTube
- Support des URL YouTube classiques et courtes.
- Extraction des métadonnées (titre, thumbnail, durée).
- Drag & drop pour l’ordre des morceaux.

### B. Synchronisation
- Format de ligne: `mm:ss | accords`.
- Exemple: `00:42 | G D Em C`.
- Recalage global via offset (+/- millisecondes).

### C. Génération automatique
- Proposition initiale d’accords par segment.
- Indicateur de confiance par segment.
- Édition rapide ligne par ligne.

### D. Doigtés / diagrammes
- Bibliothèque d’accords intégrée.
- Affichage des positions corde/frette/doigt.
- Filtre débutant (variantes faciles en priorité).

### E. Répétition
- Lecture/pause, saut ±5s.
- Vitesse 0.75x, 1x, 1.25x.
- Boucle A/B pour travailler un passage.

---

## 5) Proposition technique

### Frontend
- React + TypeScript
- Tailwind CSS
- YouTube IFrame API
- Composants: `PlaylistPanel`, `PlayerBar`, `ChordTimeline`, `ChordDiagram`

### Backend
- Node.js (NestJS recommandé)
- API REST
- Auth JWT / Google OAuth
- Service de génération d’accords (pipeline audio/IA)

### Données (schéma simplifié)
- `users`
- `playlists`
- `playlist_items` (playlist_id, song_id, order_index)
- `songs` (youtube_id, youtube_url, title, duration_s)
- `chord_tracks` (song_id, source: manual|auto, confidence_avg)
- `chord_events` (track_id, timestamp_ms, chord_label)
- `chord_shapes` (chord_label, shape_json, level)

---

## 6) MVP (version livrable rapidement)
1. Ajouter un lien YouTube à une playlist.
2. Lire le morceau sélectionné.
3. Créer une grille manuelle timecodée.
4. Surligner automatiquement l’accord en cours.
5. Afficher le diagramme du doigté de l’accord actif.

---

## 7) Évolutions
- Transposition globale (+/- demi-tons).
- Export PDF de la grille avec doigtés.
- Collaboration temps réel sur une même playlist.
- Historique des modifications de grille.

## Résultat attendu
Une interface unique et pédagogique: **à gauche la source YouTube + playlist**, **à droite les accords manuels ou auto-générés + doigtés**, pour répéter plus vite et plus juste.
