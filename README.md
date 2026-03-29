# ☢ RADIATION TOWER

> *"Rien n'est sûr dans cet hôtel. Pas même ce qui devrait vous sauver."*

**Radiation Tower** est un jeu de survie top-down en JavaScript vanilla, développé pour la **Dangerous Jam JS 2026** sur le thème **Nothing is Safe**.

Vous incarnez une survivante piégée dans l'**Hôtel Horizon**, condamné par une catastrophe nucléaire le 14 mars 2027. Neuf étages à remonter. Un secret à découvrir. Une radiation qui monte à chaque pas.

---

## Jouer

Ouvrir `index.html` dans un navigateur moderne. Aucune installation, aucune dépendance.

| Touche | Action |
|---|---|
| ↑ ↓ ← → | Déplacer la survivante |
| Entrée | Interagir — porte, objet, ascenseur |
| E | Examiner la zone |
| Échap | Menu pause |
| Clic | Utiliser un objet dans l'inventaire |

🔗 **itch.io :** [à compléter]

---

## Concept — *Nothing is Safe*

Le thème n'est pas cosmétique : il est au cœur de chaque mécanique.

- **L'eau vous contamine.** `water_bottle` soigne +15 HP mais inflige +3 Rad. La nourriture aussi. (`items.js` → `ITEMS`)
- **Monter vous irradie.** Chaque montée d'ascenseur appelle `_addRad(fl * 4)` — progresser, c'est se rapprocher de la mort. (`main.js` → `_goUp()`)
- **L'environnement se retourne contre vous.** Les événements aléatoires peuvent faire éclater un tuyau (+8 Rad, −8 HP), déclencher une surtension (−20 HP, +12 Rad), ou libérer un gaz invisible (+30 Rad d'un coup). (`events.js` → `EVENTS`)
- **Les zones "sûres" ne le sont pas.** La salle Maintenance applique ×2.2 de radiation ambiante, le Hall Ascenseur ×1.7. (`main.js` → `_doAmb()`)

---

## Mécaniques principales

### Survie
Deux jauges à gérer en permanence :
- **HP** (0–100) : diminue avec les blessures et les événements. À 0 → mort.
- **Radiation** (0–100%) : monte en continu selon la zone et l'étage. À 75%+ elle inflige des dégâts directs sur les HP. À 100% → mort par effondrement radiatif.

### Progression
Chaque étage est **verrouillé par un code à 4 chiffres** caché dans un document du couloir. Il faut explorer, lire les documents, trouver le code, puis entrer dans l'ascenseur. Certaines zones nécessitent un **badge biométrique** (badge Maintenance, badge Laboratoire).

### Inventaire
20 emplacements. Les objets ont des effets directs (consommables) ou passifs (équipements) :
- **Combinaison Hazmat** → bouclier radiation +30%
- **Comprimé d'Iode** → −20 Rad
- **Injecteur Anti-Rad** → −45 Rad mais −5 HP (rien n'est gratuit)
- **Kit Médical** → +40 HP

### Événements aléatoires
Déclenchés toutes les 5 secondes selon la fréquence réglée. 10 événements possibles, de plus en plus violents aux étages supérieurs. (`events.js`)

---

## Système de score

Géré dans `gameState.js` → module `Score`. Le score est calculé en temps réel et finalisé à la mort ou à la victoire.

| Action | Points |
|---|---|
| Ouvrir une porte | +5 |
| Ramasser un objet | 15 à 500 selon la rareté |
| Lire un document / trouver un code | +30 à +50 |
| Débloquer une porte biométrique | +80 |
| Monter un étage | étage × 80 |
| Bonus de fin : étages | étage × 150 |
| Bonus de fin : HP restants | HP × 3 |
| Pénalité : radiation | rad × −4 |
| Victoire avec les Dossiers SIGMA | +3 000 |

**Rang final :**

| Rang | Condition |
|---|---|
| S — Légende | Victoire ≥ 6 000 pts |
| A — Expert | Victoire ≥ 4 000 pts |
| B — Survivant | Victoire ≥ 2 200 pts ou défaite ≥ 1 800 pts |
| C — Téméraire | Défaite ≥ 700 pts |
| D — Oublié | Élimination rapide |

---

## Architecture du code

### Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure des écrans, HUD, modales, chargement des scripts |
| `style.css` | Tokens CSS, layout, composants visuels |
| `animations.css` | Toutes les `@keyframes` (grain, clignotements, titre radiatif) |
| `main.js` | Moteur de jeu : boucle, carte, rendu canvas, interactions, navigation |
| `gameState.js` | Module `Score` + module `Settings` + persistence localStorage |
| `items.js` | Données `ITEMS` et tables de loot `LOOT_POOLS` |
| `events.js` | Données `EVENTS` + fonction `triggerEvent()` |
| `audio.js` | Module `Audio` (effets) + `HomeMusic` + `GameMusic` — 100% Web Audio API, zéro fichier externe |

### Collisions
La carte est une grille `Uint8Array` (46×38). Chaque tuile a un type :
```js
V=0 // vide — bloquant
F=1 // sol   — franchissable
W=2 // mur   — bloquant
DO=3 // porte ouverte  — franchissable
DC=4 // porte fermée   — bloquante
DL=5 // porte verrouillée — bloquante
EL=6 // ascenseur — bloquant (interaction uniquement)
OB=7 // obstacle/décor — bloquant
```
Vérification dans `main.js` → `_doMv()` avant chaque déplacement. Limites de grille vérifiées par `inB(c, r)`.

### Boucle de jeu
```
requestAnimationFrame
  → _upd(dt)  : mouvement toutes les 110ms, radiation ambiante toutes les 5s
  → _draw()   : rendu tuile par tuile avec culling caméra
```

---

## Répartition des tâches

| Membre | Fichiers | Responsabilités |
|---|---|---|
| **Rayann** | `audio.js`, `items.js` | Sons et effets audio procéduraux · Objets, loot et effets |
| **Minna** | `index.html`, `style.css`, `main.js` (navigation) | Structure HTML et DOM · Interface et styles · Navigation entre écrans |
| **Enzo** | `gameState.js`, `main.js` (gameplay) | État du jeu et mécaniques · Boucle de jeu et interactions |
| **Aurélie** | `animations.css`, `events.js` | Animations CSS · Événements aléatoires |

