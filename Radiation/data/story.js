// ============================================================
//  data/story.js — Radiation Tower
//  Rôle : Scénariste
//
//  🔗 COMMENT UTILISER CE FICHIER — résumé pour les codeurs
//
//  1. Dans main.js, en haut du fichier, ajouter :
//     import { STORY, SCENES, JOURNAUX, getFloorText, getSceneDescription } from "../data/story.js"
//
//  2. Dans startNewGame() remplacer :
//     sceneText.textContent = "Vous ouvrez les yeux..."
//     par :
//     sceneText.textContent = STORY.intro
//
//  3. Dans nextFloorBtn listener, remplacer :
//     sceneText.textContent = `Vous atteignez l'étage ${gameState.floor}...`
//     par :
//     sceneText.textContent = getFloorText(gameState.floor)
//
//  4. Dans setGameOver(), distinguer la cause de mort :
//     if (gameState.radiation >= 100) {
//       sceneText.innerHTML = `<span class="game-over-text">${STORY.fin.radiation}</span>`
//     } else {
//       sceneText.innerHTML = `<span class="game-over-text">${STORY.fin.vie}</span>`
//     }
//
//  5. Dans getSceneByFloor(), ajouter un champ text :
//     return { image: "...", danger: "...", text: getSceneDescription(floor) }
//     Puis dans updateScene() :
//     if (!currentEvent) sceneText.textContent = scene.text
// ============================================================


// ============================================================
//  TEXTE D'INTRODUCTION
//  🔗 main.js → startNewGame() → sceneText.textContent = STORY.intro
// ============================================================

export const STORY = {

  intro:
    "Vous reprenez conscience dans le Grand Hall de l'Al Zephyr The Royal. " +
    "150 000 m² de marbre blanc. Le silence est total. " +
    "Votre dosimètre bipe toutes les trois secondes. " +
    "Quelque chose dans cet hôtel vous a invitée ici. " +
    "Rien ici n'est ce qu'il paraît. Rien n'est sûr.",


  // ============================================================
  //  TEXTES DE MONTÉE D'ÉTAGE
  //  🔗 main.js → nextFloorBtn → getFloorText(gameState.floor)
  //  Index 0 = étages 1-2 / 1 = étages 3-4 / 2 = étages 5-6 / 3 = étages 7+
  // ============================================================

  monteeEtage: [
    // étages 1-2
    "Vous montez. Chaque marche grince différemment, " +
    "comme si l'escalier apprenait votre poids. " +
    "L'air devient plus lourd. La tour mémorise votre présence.",

    // étages 3-4
    "L'ascenseur panoramique s'ouvre seul avant que vous appuyiez sur le bouton. " +
    "Par les vitres, la ville brille dans le noir. " +
    "La cabine sent quelque chose que vous préférez ne pas identifier.",

    // étages 5-6
    "Un drone de maintenance vous précède dans le couloir. " +
    "Il s'arrête devant une porte dérobée et clignote trois fois. " +
    "Il sait où vous devez aller. Vous ne savez pas comment.",

    // étages 7+
    "Les murs du couloir pulsent légèrement. " +
    "Pas les lumières. Les murs eux-mêmes. " +
    "Vous posez une main dessus. Ils sont chauds. " +
    "Et ils bougent, très lentement. Comme une respiration. " +
    "Continuez. Ne vous arrêtez pas."
  ],


  // ============================================================
  //  TEXTES DE FIN DE JEU
  //  🔗 main.js → setGameOver()
  //  Distinguer : radiation >= 100 → fin.radiation / vie <= 0 → fin.vie
  // ============================================================

  fin: {

    radiation:
      "La radiation a eu raison de vous. " +
      "Votre corps ne sait plus qu'il a mal. " +
      "Le sol est frais contre votre joue. " +
      "La moquette de luxe absorbe votre chaleur, votre poids, vos derniers mouvements. " +
      "La tour vous a intégrée. Vous faites maintenant partie de ses murs.",

    vie:
      "Quelque chose dans la tour a eu raison de vous. " +
      "Quelque part dans les étages supérieurs, la tour note votre absence. " +
      "Elle ajuste ses paramètres. Elle apprend de chaque visiteur. " +
      "La prochaine fois, elle sera plus rapide. Plus convaincante. " +
      "Rien dans cet hôtel n'était sûr. Vous le savez maintenant."
  }

}


// ============================================================
//  DESCRIPTIONS DES SCÈNES
//  🔗 main.js → getSceneByFloor() → ajouter champ text
//  Utiliser getSceneDescription(floor) pour obtenir le bon texte
// ============================================================

export const SCENES = {

  // Étages 0-1 — Grand Hall / Réception
  reception: [
    // version calme (étage 0)
    "Le Grand Hall est immense et silencieux. " +
    "Vos pas résonnent sur le marbre blanc et chaque écho revient légèrement décalé, " +
    "comme si quelque chose marchait en même temps que vous.",

    // version tendue (étage 1)
    "Les trois aquariums géants longent les murs. " +
    "Les poissons vous regardent tous. " +
    "Ils ne bougent plus. Ils attendent.",

    // version critique (étage 1 à radiation élevée)
    "Le marbre a fondu par endroits. " +
    "Dans l'aquarium du fond, les poissons luisent en vert. " +
    "La vitre craque sous leur pression collective."
  ],

  // Étages 2-3 — Corridor des suites
  couloir: [
    "La moquette couleur sable absorbe vos pas. " +
    "Vous n'entendez plus votre propre marche. " +
    "Vous n'entendrez pas non plus ce qui approche.",

    "Les portes des suites sont ouvertes. " +
    "Pas enfoncées — ouvertes proprement, de l'intérieur. " +
    "Les tablettes de contrôle clignotent au rythme d'une respiration.",

    "Sur un mur, gravé dans le plâtre jusqu'à ce que l'outil casse : " +
    "'NE REGARDEZ PAS EN HAUT'. " +
    "Vous ne regardez pas en haut. " +
    "Quelque chose bouge au plafond."
  ],

  // Étages 4-6 — Salle technique / Maintenance
  maintenance: [
    "La salle technique pulse comme un organe. " +
    "Tout tourne encore. Personne n'a pu couper l'alimentation.",

    "Sur le dernier écran fonctionnel : " +
    "une caméra en direct du couloir que vous venez de quitter. " +
    "Quelque chose y marche maintenant. " +
    "Il cherche la porte que vous avez laissée ouverte.",

    "Les serveurs brûlent sans flamme. " +
    "Une chaleur blanche irradie des armoires de données. " +
    "C'est ici que le système de ventilation a tout propagé."
  ],

  // Étages 7+ — Suite privée / Laboratoire
  laboratoire: [
    "Derrière un panneau de marbre : un laboratoire. " +
    "Propre. Ordonné. Sur le sol : une paire de chaussures, encore lacées. " +
    "Juste les chaussures.",

    "Les incubateurs ont débordé. " +
    "Les échantillons ont traversé les parois de verre — pas cassé, traversé. " +
    "La même phrase sur tous les murs : 'TAUX D'ADAPTATION : EXCEPTIONNEL'.",

    "Au centre, un carnet ouvert. Encre encore fraîche. " +
    "Dernière ligne, datée d'aujourd'hui : " +
    "'Elle est entrée. Elle ne sait pas encore que c'est ce que je voulais.'"
  ]

}


// ============================================================
//  JOURNAUX CACHÉS
//  🔗 interactions.js (à connecter quand ce fichier sera codé)
//  Afficher dans sceneText ou logList quand le joueur fouille.
//  Condition : gameState.floor >= journal.etageMin
// ============================================================

export const JOURNAUX = [

  {
    id: "journal_01",
    etageMin: 1,
    scene: "reception",
    titre: "Avis TripAdvisor — 12 mars 2039",
    texte:
      "★★★★★ — 'Parfait. Mais ne prenez pas l'ascenseur nord.' " +
      "Les bruits la nuit ne ressemblent pas à des travaux. " +
      "Quelqu'un a glissé un mot sous notre porte : 'Ne prenez pas l'ascenseur nord.' " +
      "Ce matin, la personne de la chambre 2231 a disparu. " +
      "Check-out enregistré à 3h47. Elle avait des bagages pour le lendemain."
  },

  {
    id: "journal_02",
    etageMin: 2,
    scene: "couloir",
    titre: "Email interne — Direction — 13 mars 2039",
    texte:
      "CONFIDENTIEL. Cinq membres du personnel hospitalisés cette nuit. " +
      "Brûlures internes sans cause externe. Perte de cheveux en 6 heures. " +
      "Deux d'entre eux ont cessé de reconnaître leurs propres mains. " +
      "Le Gala de réouverture est dans 36 heures. Les journalistes sont là. " +
      "Discrétion absolue. Facturez la holding, pas l'hôtel."
  },

  {
    id: "journal_03",
    etageMin: 4,
    scene: "maintenance",
    titre: "Rapport de sécurité — Rania Al-Farsi — 03h14",
    texte:
      "Suite 4301. Le locataire Zhao est introuvable. " +
      "J'ai envoyé deux agents. Entrés. Pas ressortis. " +
      "Les murs n'étaient plus tout à fait des murs. " +
      "Il y avait des formes dans les murs qui ressemblaient à des agents. " +
      "J'ordonne l'évacuation. La direction demande d'attendre. " +
      "Je n'attends pas. — R.A.F [Dernière entrée dans le système]"
  },

  {
    id: "journal_04",
    etageMin: 7,
    scene: "laboratoire",
    titre: "Carnet — Dr. Wei Zhao — dernière entrée",
    texte:
      "Je n'écris plus pour moi. J'écris pour toi. " +
      "Tu crois que tu cherches des preuves. " +
      "La tour ne laisse pas entrer les gens. Elle les invite. " +
      "Le message sur ton téléphone — c'est elle qui l'a envoyé. " +
      "Je m'appelle Wei Zhao. J'étais chercheur. " +
      "Maintenant je suis le 4ème étage. Bienvenue dans la tour."
  }

]


// ============================================================
//  FONCTION : texte de montée d'étage
//  🔗 main.js → nextFloorBtn listener
//  Remplacer : sceneText.textContent = `Vous atteignez l'étage ${gameState.floor}...`
//  Par :       sceneText.textContent = getFloorText(gameState.floor)
// ============================================================

export function getFloorText(floor) {
  if (floor <= 2) return `Étage ${floor}. ` + STORY.monteeEtage[0]
  if (floor <= 4) return `Étage ${floor}. ` + STORY.monteeEtage[1]
  if (floor <= 6) return `Étage ${floor}. ` + STORY.monteeEtage[2]
  return `Étage ${floor}. ` + STORY.monteeEtage[3]
}


// ============================================================
//  FONCTION : description de la scène selon l'étage
//  🔗 main.js → getSceneByFloor() → ajouter : text: getSceneDescription(floor)
// ============================================================

export function getSceneDescription(floor) {
  if (floor === 0) return SCENES.reception[0]
  if (floor === 1) return SCENES.reception[1]
  if (floor <= 3) return SCENES.couloir[floor - 2] || SCENES.couloir[2]
  if (floor <= 6) return SCENES.maintenance[floor - 4] || SCENES.maintenance[2]
  return SCENES.laboratoire[Math.min(floor - 7, 2)]
}
