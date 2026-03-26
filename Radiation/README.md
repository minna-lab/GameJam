# ☢ HORIZON — Nothing is Safe

> *"Une catastrophe nucléaire. Un hôtel abandonné. Neuf étages pour survivre et découvrir la vérité."*

---

## 📋 Présentation

**HORIZON — Nothing is Safe** est un jeu de survie en vue de dessus développé en **HTML/CSS/JavaScript pur**, sans moteur de jeu ni bibliothèque externe.

Le jeu a été réalisé dans le cadre du **Dangerous Jam JS 2026**, dont le thème imposé était **"Nothing is Safe"**. Il respecte les contraintes de la jam : fichiers HTML/CSS/JS uniquement, condition de perte obligatoire, et système de scoring arcade.

Le joueur incarne une survivante qui se réveille dans un hôtel abandonné après un incident nucléaire survenu le 14 mars 2027. Elle doit explorer 9 étages de plus en plus irradiés, trouver le programme secret SIGMA, et s'échapper avant que la radiation ne l'emporte.

---

## 👥 Équipe

| Membre | Rôle |
|--------|------|
| **Rayann** | Développement moteur de jeu, rendu canvas, physique et caméra |
| **Minna** | Design UI/UX, système de CSS, page d'accueil et écrans de navigation |
| **Enzo** | Système audio procédural (Web Audio API), effets sonores, moteur Geiger |
| **Aurélie** | Game design, narration, système d'événements, écriture des documents in-game |

---

## 🗂️ Structure du projet

```
horizon/
│
├── index.html        → Structure HTML : écrans, modales, chargement des scripts
├── style.css         → Intégralité du design visuel (palette, layout, composants)
├── animations.css    → Keyframes CSS uniquement (grain, fondu, tremblement…)
│
├── audio.js          → Moteur audio Web Audio API — tous les sons procéduraux
├── gameState.js      → Modules Score et Settings (état global + localStorage)
├── items.js          → Base de données des objets et tables de loot par salle
├── events.js         → Événements aléatoires et déclencheur
└── main.js           → Moteur de jeu complet + App navigation + boot
```

### Détail de chaque fichier

#### `index.html`
Point d'entrée unique du projet. Ne contient aucune logique JavaScript inline. Déclare les 6 écrans principaux (`home`, `rules`, `settings`, `scores`, `gameover`, `game`), les 2 modales de jeu (document et verrou biométrique/code), l'overlay pause, et charge les scripts dans le bon ordre de dépendance.

#### `style.css` (~500 lignes)
Tous les styles visuels, organisés par section :
- Variables de design (`:root`) — palette, polices, effets
- Effets globaux — grain filmique, scanlines, curseur personnalisé
- Écran d'accueil — layout split-screen cinématique
- Écran des règles — panneau scrollable avec grille de mécaniques
- Écrans de navigation — paramètres, classement, game over
- Interface de jeu — HUD, panneaux gauche/centre/droit, inventaire, journal
- Overlay pause — menu contextuel mid-game

#### `animations.css` (~25 lignes)
Fichier dédié aux `@keyframes` uniquement : `fadeslide`, `grain-shift`, `pulse-dot`, `warn-blink`, `bar-crit`, `log-in`, `score-pop`, `code-pulse`, `shake`, `geiger-pulse`, `hero-number`, `rules-in`.

#### `audio.js` (~170 lignes)
Moteur audio entièrement procédural basé sur la Web Audio API. Aucun fichier sonore externe.

Fonctionnalités :
- Fonction `osc()` — oscillateur avec enveloppe ADSR simplifiée
- Fonction `sweep()` — oscillateur à fréquence glissante
- Fonction `noise()` — bruit blanc filtré (bandpass) pour les impacts et clicks
- Sons de ramassage différenciés : consommable, équipement, document, clé, générique
- Sons de dégâts : impact physique vs dégât radiatif
- Sons de radiation : 3 niveaux (faible / moyen / critique)
- Sons de danger et de peur : sirène descendante, stinger psychologique
- Compteur Geiger adaptatif : fréquence proportionnelle au niveau de radiation
- Drone ambiant grave : activé au-dessus de 30% de radiation
- Module `play(nom, soustype)` pour le dispatch centralisé

#### `gameState.js` (~175 lignes)
Deux modules encapsulés en IIFE :

**Module `Score`** :
- `reset()` / `get()` / `add(catégorie, points, couleur)` — gestion temps réel
- `calcFinal()` — bonus étages (×150), HP (×3), pénalité radiation (×−4), bonus victoire (+3000)
- `rank()` — attribution des rangs S/A/B/C/D
- `save()` / `load()` / `clear()` — persistence dans `localStorage` (clé `horizon_scores_v1`, 20 entrées max)
- Pop-up de score animé sur le canvas

**Module `Settings`** :
- Valeurs par défaut : grain, vignette, shake, son, volumes Geiger/ambiance, difficulté radiation (0–3), fréquence événements (0–3), nom joueur
- `open(from)` — stocke l'écran d'origine pour la navigation contextuelle
- `closeFromContext()` — retourne au jeu ou à l'accueil selon l'origine
- Persistence dans `localStorage` (clé `horizon_settings_v1`)

#### `items.js` (~30 lignes)
Objet `ITEMS` avec 14 entrées, chacune définissant : `id`, `name`, `icon`, `type`, `desc`, `flavor`, `effect`, `rarity`, `pts`.

Types d'objets : `consumable`, `equipment`, `key`, `lore`, `tool`, `document`

Objet `LOOT_POOLS` : 7 tables associant chaque type de salle à une liste d'items pouvant y apparaître (hall, réception, restaurant, cuisine, couloir, maintenance, défaut).

#### `events.js` (~30 lignes)
Tableau `EVENTS` de 10 événements narratifs avec effets HP/radiation et son associé. Fonction `triggerEvent()` qui reçoit les callbacks du moteur (`addRad`, `dmg`, `heal`, `redRad`, `log`, `notif`) pour appliquer les effets sans couplage direct avec `main.js`.

#### `main.js` (~850 lignes)
Le cœur du projet. Contient :

- **Constructeurs de carte** : `buildRDC()` pour le rez-de-chaussée fixe (10 salles), `buildTFloor()` pour les étages 2–9 procéduraux (4 variantes de plan en T, palettes de couleurs cycliques)
- **Helpers** : `inB()`, `rmAt()`, `rmNear()`, `darken()`, `lighten()`
- **Styles de sol** : `getFStyle()` — 6 types (chevron, marbre, arête-de-poisson, moquette, béton, carrelage)
- **Chargement d'étage** : `loadFloor()` — construit la map, place le loot, initialise les portes
- **Boucle de jeu** : `requestAnimationFrame` à ~60 FPS, delta-time plafonné à 50ms
- **Rendu canvas** : 7 passes (sols, murs, portes animées, décors, loot, personnage, mini-carte)
- **Personnage** : dessin procédural (corps, membres, visage, cheveux, masque à gaz optionnel)
- **Interactions** : `_doInteract()`, `_pickLoot()`, `_doDoor()`, `_openElev()`, `_openBio()`
- **Système de stats** : `_addRad()`, `_dmg()`, `_heal()`, `_redRad()`, `_chk()`
- **UI** : `_refreshStats()`, `_renderInv()`, `_selItem()`, `_useItem()`, `_log()`, `_notif()`
- **Fin de partie** : `_die()`, `_doVictory()`, `_endScreen()`
- **Pause** : `openPause()`, `closePause()` avec arrêt du Geiger
- **Module `App`** : navigation entre les 6 écrans, rendu du classement, démarrage du jeu

---

## 🎮 Mécaniques de jeu

### Déplacement
La survivante se déplace case par case sur une grille 46×38. Les touches directionnelles ou WASD déplacent le personnage. Les murs, objets de décor et portes fermées bloquent le passage. La caméra suit le joueur avec un lerp à 20%.

### Radiation
- Augmente en permanence toutes les 5 secondes selon l'étage et la zone
- Zones plus contaminées : Maintenance (×2.2), Hall Ascenseur (×1.7), Stockage (×1.3)
- Chambres d'hôtel moins contaminées (×0.7)
- Au-dessus de 75% : dégâts directs sur les HP à chaque tick
- La combinaison hazmat réduit l'absorption de 30%, le masque à gaz de 15%
- Multiplicateur de difficulté : ×0.4 / ×1 / ×1.5 / ×2 selon le réglage

### Ascenseur
Chaque étage est verrouillé. Un document (identifiable par son halo bleu) contient le code à 4 chiffres pour monter. Monter irradie proportionnellement à l'étage actuel.

### Inventaire
20 emplacements. Les équipements (combinaison, masque) s'utilisent pour les équiper. Les consommables se détruisent après usage. Les documents se lisent et peuvent être conservés. Les badges restent en inventaire et s'utilisent devant une porte biométrique.

### Événements aléatoires
Déclenchés toutes les 5 secondes avec une probabilité configurable. 10 événements possibles, filtrés par étage (plus d'événements dangereux aux étages supérieurs).

### Score
Calculé en continu pendant la partie :

| Action | Points |
|--------|--------|
| Ouvrir une porte | +5 |
| Ramasser un objet | Variable selon l'item (15–500) |
| Trouver un document (garder) | +50 / +30 |
| Déverrouiller une porte biométrique | +80 |
| Monter un étage | étage × 80 |
| Exploration | +1 à +3 aléatoire |

**Calcul final :**
```
Score final = Score courant
            + (étage atteint × 150)     → bonus exploration
            + (HP restants × 3)         → bonus survie
            − (radiation % × 4)         → pénalité contamination
            + 3000                      → bonus victoire uniquement
```

### Rangs

| Rang | Victoire | Défaite |
|------|----------|---------|
| **S** | ≥ 6 000 pts | — |
| **A** | ≥ 4 000 pts | — |
| **B** | ≥ 2 200 pts | ≥ 1 800 pts |
| **C** | Par défaut | ≥ 700 pts |
| **D** | — | Par défaut |

---

## 🗺️ Structure de l'hôtel

### Rez-de-chaussée (fixe)

| Salle | Accès | Loot notable |
|-------|-------|--------------|
| Hall d'Accueil | Libre | Photos, lampe torche, iode |
| Réception | Libre | Badge Maintenance, eau |
| Restaurant | Libre | Conserves, eau, photos |
| Couloir RDC | Libre | **Document avec code ascenseur** |
| Maintenance | Badge rouge | Hazmat, masque, Geiger, injecteur, **Badge Labo** |
| Hall Ascenseur | Libre | — |
| Salle Personnel | Libre | Objets génériques |
| Sanitaires | Libre | Objets génériques |
| Stockage | Libre | Objets génériques |
| Cuisine | Libre | Nourriture, kit médical |

### Étages 2–9 (procéduraux)
4 variantes de plan en T qui se répètent en cycle (étages 2, 6 → variante 0 ; étages 3, 7 → variante 1 ; etc.). Chaque variante a sa propre palette de couleurs (rouge, bleu, vert, ambre). Les chambres contiennent du loot aléatoire. Un document de code est caché dans le couloir principal de chaque étage.

---

## 🔊 Design sonore

Tous les sons sont générés en temps réel par la Web Audio API, sans aucun fichier audio externe.

| Événement | Son |
|-----------|-----|
| Ramasser un médicament | Double bip médical propre |
| Ramasser un équipement | Impact lourd + clic métallique |
| Ramasser un document | Froissement de papier + note basse |
| Ramasser un badge | Bip électronique triple |
| Ouvrir une porte | Mécanisme sourd |
| Porte verrouillée | Double bip de refus |
| Code accepté | Accord montant propre |
| Code refusé | Buzzer descendant |
| Montée d'étage | Accord ascendant + impact |
| Dégât physique | Impact sourd grave |
| Dégât radiatif | Bourdonnement avec distorsion |
| Radiation faible | Click Geiger isolé |
| Radiation moyenne | Burst + bip |
| Radiation critique | Salve + oscillateur aigu |
| Événement danger | Sirène descendante |
| Événement peur | Stinger aigu + silence grave |
| Compteur Geiger | Boucle adaptative (2200ms → 55ms selon radiation) |
| Ambiance | Drone grave pulsant au-dessus de 30% radiation |
| Game over | Effondrement chromatique grave |
| Victoire | Fanfare 5 notes montantes |

---

## 🖥️ Compatibilité et lancement

### Prérequis
- Navigateur moderne avec support Web Audio API (Chrome 66+, Firefox 60+, Safari 14+, Edge 79+)
- Connexion Internet pour le chargement des polices Google Fonts (Bebas Neue, IBM Plex Mono, Libre Baskerville, Barlow Condensed)
- JavaScript activé

### Lancement
```bash
# Option 1 — Serveur local simple (recommandé)
cd horizon/
python3 -m http.server 8080
# Ouvrir http://localhost:8080

# Option 2 — Extension VS Code Live Server
# Clic droit sur index.html → Open with Live Server

# Option 3 — Ouvrir directement
# Double-clic sur index.html (fonctionne dans la plupart des navigateurs)
```

> **Note :** Le jeu fonctionne entièrement en local. Les seules requêtes réseau sont les polices Google Fonts. Aucune donnée n'est envoyée à un serveur.

### Données persistantes
Les scores et paramètres sont sauvegardés dans le `localStorage` du navigateur sous deux clés :
- `horizon_scores_v1` — historique des 20 meilleurs scores
- `horizon_settings_v1` — réglages et nom du joueur

---

## 🎨 Palette et typographie

### Couleurs

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--ink` | `#0a0805` | Fond principal |
| `--paper` | `#e8dcc8` | Texte principal |
| `--rust` | `#c4501a` | Couleur d'accent primaire |
| `--bile-bright` | `#b8d420` | Succès, Geiger, victoire |
| `--blood` | `#8b1a1a` | Danger, mort |
| `--ash-light` | `#6b6258` | Texte secondaire |

### Polices

| Police | Usage |
|--------|-------|
| Bebas Neue | Titres, HUD, score |
| IBM Plex Mono | Corps de texte, logs, valeurs |
| Libre Baskerville | Citations narratives, descriptions |
| Barlow Condensed | Labels, étiquettes, boutons |

---

## ⌨️ Contrôles

| Touche | Action |
|--------|--------|
| `↑ ↓ ← →` ou `W A S D` | Déplacer le personnage |
| `ENTRÉE` | Interagir (porte, objet, ascenseur) |
| `E` | Examiner la zone actuelle |
| `ESC` | Ouvrir / fermer le menu pause |
| `Clic` | Sélectionner un objet dans l'inventaire |

---

## 📦 Objets du jeu

| Objet | Type | Effet | Points |
|-------|------|-------|--------|
| Dossiers SIGMA | Lore légendaire | Condition de victoire | 500 |
| Badge Maintenance | Clé | Déverrouille Maintenance | 80 |
| Badge Laboratoire | Clé | Déverrouille zones SIGMA | 150 |
| Comprimé d'Iode | Consommable | Rad −20 | 20 |
| Injecteur Anti-Rad | Consommable | Rad −45, HP −5 | 60 |
| Eau en Bouteille | Consommable | HP +15, Rad +3 | 15 |
| Kit Médical | Consommable | HP +40 | 40 |
| Conserve | Consommable | HP +20, Rad +3 | 20 |
| Combinaison Hazmat | Équipement | Bouclier +30% | 100 |
| Masque à Gaz | Équipement | Bouclier +15% | 50 |
| Compteur Geiger | Outil | — | 30 |
| Lampe Torche | Outil | — | 15 |
| Page de Journal | Lore | — | 35 |
| Vieille Photographie | Lore | — | 25 |

---

## 📝 Contraintes respectées (Dangerous Jam JS)

- [x] HTML, CSS, JavaScript uniquement — aucune bibliothèque externe, aucun moteur
- [x] Condition de perte — mort par HP à 0 ou radiation à 100%
- [x] Système de scoring arcade — score en temps réel, calcul final, classement persistant
- [x] Fichier unique jouable — `index.html` avec les scripts liés localement

---

## 🔮 Pistes d'amélioration futures

- Étage 9 avec boss final et accès au réacteur SIGMA
- Système de craft (combiner objets pour créer du matériel de soin)
- Journal narratif complet avec 20+ pages de documents in-game
- Mode coopératif local (2 joueurs sur le même clavier)
- Génération procédurale des étages avec algorithme de type BSP
- Effets de lumière dynamiques autour du personnage
- Sauvegarde de partie en cours (localStorage)
- Export du score sous forme de capture ou de code partageable

---

## 📄 Licence

Projet réalisé dans le cadre du Dangerous Jam JS 2026. Code et assets libres de droit pour usage éducatif et non commercial.

---

*☢ RADIATION TOWER — Nothing is Safe · Rayann · Minna · Enzo · Aurélie · 2026*