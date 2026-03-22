// ============================================================
//  data/items.js — Radiation Tower
//  Rôle : Scénariste
//
//  🔗 COMMENT UTILISER CE FICHIER — résumé pour les codeurs
//
//  1. Dans events.js, en haut du fichier, ajouter :
//     import { ITEMS, getRandomItem } from "../data/items.js"
//
//  2. Dans randomEvent(), remplacer les fonctions rustyObject(),
//     medicalKit(), electronicDevice() par :
//     const item = getRandomItem()
//     return {
//       type: "object",
//       name: item.nom,
//       text: item.description,         ← affiché dans sceneText
//       heal: item.heal || 0,           ← lu par useObject()
//       damage: item.damage || 0,       ← lu par useObject()
//       contaminatedChance: item.contaminatedChance(gameState.floor),
//       trapText: item.trapText,        ← texte si piège déclenché
//       useText: item.useText           ← texte si utilisation normale
//     }
//
//  3. Dans useObject() de events.js, après avoir déterminé
//     si l'objet est contaminé, afficher le bon texte :
//     if (contaminated) {
//       return event.trapText || "L'objet est contaminé ! Radiation +" + radiationGain
//     }
//     if (event.heal) {
//       heal(event.heal)
//       return event.useText || "Vous utilisez l'objet. Vie +" + event.heal
//     }
//     etc.
//
//  ☠ NOTHING IS SAFE : chaque objet a une probabilité de piège
//  même les objets de soin peuvent empoisonner.
//  La fonction contaminatedChance(floor) est calibrée par objet.
// ============================================================


// ============================================================
//  LISTE DES OBJETS
//  Chaque objet a exactement les champs attendus par events.js :
//  - nom            → currentEvent.name → itemName
//  - description    → currentEvent.text → sceneText (quand exploré)
//  - heal           → currentEvent.heal → useObject()
//  - damage         → currentEvent.damage → useObject()
//  - contaminatedChance(floor) → Math.random() < event.contaminatedChance
//  - trapText       → texte affiché si piège déclenché
//  - useText        → texte affiché si utilisation normale
// ============================================================

export const ITEMS = [


  // ========== OBJETS DE SOIN — peuvent aussi empoisonner ==========

  {
    id: "kit_medical",
    nom: "Kit médical du spa",
    emoji: "🩺",
    description:
      "Un kit médical abandonné dans une suite. " +
      "Bandages, analgésiques, compresses. " +
      "Il a été rangé pour des accidents de bien-être. Pas pour ça. " +
      "Mais vous saignez. Et il est là.",
    heal: 25,
    damage: 0,
    contaminatedChance: (floor) => Math.min(0.25 + floor * 0.02, 0.7),
    trapText:
      "Le bandage adhère trop vite. Une brûlure froide remonte votre bras. " +
      "Le kit était stocké dans une zone contaminée. " +
      "Vous venez d'appliquer de la radiation directement sur votre peau.",
    useText:
      "Vous vous soignez à la hâte, les yeux sur la porte. " +
      "Ça va mieux. Pour combien de temps ?"
  },

  {
    id: "room_service",
    nom: "Plateau de room service",
    emoji: "🍽️",
    description:
      "Un plateau hermétique. Livré. Jamais récupéré. " +
      "Homard bleu, dattes, eau minérale. Scellé sous vide. " +
      "L'étiquette dit 'Frais — 48h'. " +
      "Il y a 14 mois que ce plateau attend ici.",
    heal: 30,
    damage: 0,
    contaminatedChance: (floor) => Math.min(0.40 + floor * 0.02, 0.85),
    trapText:
      "La douleur arrive 30 secondes après la première bouchée. " +
      "Le scellage sous vide avait tenu. " +
      "Ce qu'il y avait dans l'air de la tour, non. " +
      "Vous venez de manger de la radiation.",
    useText:
      "Vous mangez debout, les yeux sur le couloir. " +
      "C'est le meilleur repas de votre vie. Vous ne goûtez rien."
  },

  {
    id: "capsules_detox",
    nom: "Capsules détox du spa",
    emoji: "💊",
    description:
      "Un flacon de capsules. Étiquette : 'Détox aux oligo-éléments premium.' " +
      "En réalité : iodure de potassium. L'antidote aux radiations. " +
      "Quelqu'un dans cet hôtel avait préparé ça. Pour qui ?",
    heal: 0,
    damage: 0,
    radiation: -25,                   // effet spécial : réduit la radiation
    contaminatedChance: (floor) => Math.min(0.30 + floor * 0.02, 0.75),
    trapText:
      "Ce n'était pas de l'iodure de potassium. " +
      "L'étiquette mentait — ou quelqu'un l'a remplacée. " +
      "La brûlure dans votre gorge vous dit que vous venez d'avaler autre chose.",
    useText:
      "Vous avalez deux capsules sans eau. " +
      "Votre dosimètre ralentit. Juste assez pour continuer."
  },

  {
    id: "eau_minerale",
    nom: "Eau minérale d'Islande",
    emoji: "💧",
    description:
      "Conditionnée dans du verre soufflé. 30$ la bouteille. Encore scellée. " +
      "Des empreintes de doigts pressées très fort dans le verre. " +
      "Quelqu'un avait très peur quand il a lâché ça. " +
      "Demandez-vous pourquoi il l'a lâchée.",
    heal: 15,
    damage: 0,
    contaminatedChance: (floor) => Math.min(0.35 + floor * 0.02, 0.80),
    trapText:
      "L'eau a un goût de métal et de quelque chose de doux. Trop doux. " +
      "C'est l'eau du circuit de refroidissement de la tour. " +
      "Irradiée depuis un an. Vous venez de la boire.",
    useText:
      "L'eau est froide. Vous avez oublié ce que c'était, le froid. " +
      "Vous récupérez un peu de force."
  },


  // ========== OBJETS DE PROTECTION — peuvent aussi irradier ==========

  {
    id: "peignoir_plombe",
    nom: "Peignoir lesté",
    emoji: "🥼",
    description:
      "Un peignoir blanc. Il pèse 12 kilos. " +
      "Quelqu'un a cousu des feuilles de plomb entre les couches de coton. " +
      "Ce n'était pas un vrai peignoir. " +
      "Quelqu'un vivait ici en sachant ce qui se passait au-dessus.",
    heal: 0,
    damage: 0,
    protection: 0.4,                  // réduit la radiation de 40% pendant 5 tours
    contaminatedChance: (floor) => Math.min(0.20 + floor * 0.02, 0.65),
    trapText:
      "Le plomb dans le peignoir est chaud. Pas tiède — chaud. " +
      "Il a été exposé si longtemps aux radiations qu'il est devenu une source. " +
      "Vous venez de vous envelopper dans un émetteur de radiation.",
    useText:
      "Vous enfilez le peignoir. Il est trop lourd. " +
      "Mais votre dosimètre ralentit. Vous le gardez."
  },

  {
    id: "masque_plongee",
    nom: "Masque de plongée intégral",
    emoji: "🤿",
    description:
      "Masque intégral avec filtre HEPA. " +
      "Quelqu'un est monté avec. Ne l'a pas rapporté. " +
      "Retrouvé ici. Sans la personne. " +
      "Le filtre a l'air intact. 'A l'air.'",
    heal: 0,
    damage: 0,
    protection: 0.45,
    contaminatedChance: (floor) => Math.min(0.30 + floor * 0.02, 0.75),
    trapText:
      "Le filtre est saturé. Il y a un an, il était neuf. " +
      "À chaque inspiration, il vous restitue ce qu'il a accumulé. " +
      "Vous inhalez la radiation concentrée de la tour. " +
      "Vous arrachez le masque en toussant.",
    useText:
      "L'air à l'intérieur est propre, sec, neutre. " +
      "Vous entendez votre propre respiration amplifiée. " +
      "Et tous les bruits du couloir aussi."
  },


  // ========== OBJETS DE COMBAT — peuvent se retourner ==========

  {
    id: "extincteur",
    nom: "Extincteur chrome brossé",
    emoji: "🧯",
    description:
      "Chrome brossé, forme organique. " +
      "Même les extincteurs sont beaux dans ce palace. " +
      "Pression maximale. Certifié 2038. " +
      "Deux ans dans une zone de radiation extrême.",
    heal: 0,
    damage: 30,
    contaminatedChance: (floor) => Math.min(0.30 + floor * 0.02, 0.75),
    trapText:
      "La cuve résiste une seconde — puis quelque chose lâche. " +
      "L'extincteur vous arrache des mains, ricoche contre le mur, revient vers vous. " +
      "7 kilos d'acier chromé à pleine vitesse.",
    useText:
      "Vous pulvérisez le CO₂. " +
      "Le nuage blanc envahit la pièce. " +
      "Quelques secondes de répit dans le froid brutal."
  },

  {
    id: "barre_titane",
    nom: "Barre de structure en titane",
    emoji: "⚒️",
    description:
      "Un morceau arraché d'une structure de la tour. " +
      "Sept kilos. Ne pliera pas. " +
      "Mais il est chaud au toucher. " +
      "Les métaux absorbent et restituent la radiation.",
    heal: 0,
    damage: 35,
    contaminatedChance: (floor) => Math.min(0.25 + floor * 0.02, 0.70),
    trapText:
      "Après le troisième coup, vos paumes brûlent. " +
      "Pas de l'effort. De la radiation. " +
      "Le titane a absorbé des mois d'exposition. " +
      "À chaque contact, il vous en transfère une partie.",
    useText:
      "Sept kilos de titane. Vous frappez de toutes vos forces. " +
      "L'impact résonne dans tout l'étage."
  },


  // ========== OBJETS NARRATIFS — risque faible mais réel ==========

  {
    id: "lampe_torche",
    nom: "Lampe tactique",
    emoji: "🔦",
    description:
      "La lampe du chef de sécurité. 1000 lumens. " +
      "Trouvée à côté d'un café froid sur un bureau. " +
      "Elle est partie si vite qu'elle n'a pas pris sa lampe. " +
      "Ou elle n'a pas eu le temps.",
    heal: 0,
    damage: 0,
    exploreBonus: true,               // augmente les chances de trouver un journal
    contaminatedChance: (floor) => Math.min(0.15 + floor * 0.01, 0.50),
    trapText:
      "Le faisceau éclaire le fond du couloir. " +
      "Quelque chose dans le fond du couloir l'a vu. " +
      "Il y avait une raison pour laquelle tout était éteint ici. " +
      "Éteignez. Courez.",
    useText:
      "Le faisceau découpe le couloir en tranches précises. " +
      "Dans l'angle non éclairé, quelque chose brille. " +
      "Vous allez le chercher."
  },

  {
    id: "carnet_zhao",
    nom: "Carnet du Dr. Zhao",
    emoji: "📓",
    description:
      "Un carnet Moleskine couvert de formules et de notes en trois langues. " +
      "La dernière page est ouverte. L'encre est encore fraîche. " +
      "Quelqu'un écrit dans ce carnet. Encore maintenant.",
    heal: 0,
    damage: 0,
    journal: "journal_04",            // déclenche l'affichage du journal_04 de story.js
    contaminatedChance: (floor) => 0.05,
    trapText:
      "Une fine poussière s'échappe du carnet quand vous le fermez. " +
      "Vous l'inhalez avant de pouvoir reculer. " +
      "La poussière de papier irradié. Vous toussez.",
    useText:
      "Vous lisez. Les pages se déchiffrent lentement. " +
      "Vous comprenez enfin ce qui s'est passé dans cet hôtel. " +
      "Vous auriez préféré ne pas comprendre."
  }

]


// ============================================================
//  FONCTION : obtenir un objet aléatoire
//  🔗 events.js → randomEvent() → remplacer rustyObject() etc.
//
//  Exemple d'utilisation dans events.js :
//
//  import { getRandomItem } from "../data/items.js"
//
//  export function randomEvent() {
//    const rand = Math.random()
//    if (rand < 0.85) {
//      const item = getRandomItem()
//      return {
//        type: "object",
//        name: item.nom,
//        text: item.description,
//        heal: item.heal || 0,
//        damage: item.damage || 0,
//        radiation: item.radiation || 0,
//        contaminatedChance: item.contaminatedChance(gameState.floor),
//        trapText: item.trapText,
//        useText: item.useText
//      }
//    }
//    return emptyRoom()
//  }
// ============================================================

export function getRandomItem() {
  const index = Math.floor(Math.random() * ITEMS.length)
  return ITEMS[index]
}


// ============================================================
//  FONCTION : retrouver un objet par son id
//  🔗 interactions.js ou partout où on cherche un objet précis
//  Exemple : const item = getItem("kit_medical")
// ============================================================

export function getItem(id) {
  return ITEMS.find(item => item.id === id) || null
}
