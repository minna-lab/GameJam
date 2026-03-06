// events.js

import { gameState, damage, addRadiation, heal } from "./gameState.js"

// générer un événement dans la pièce
export function randomEvent() {

  const rand = Math.random()

  if (rand < 0.3) return rustyObject()
  if (rand < 0.6) return medicalKit()
  if (rand < 0.85) return electronicDevice()

  return emptyRoom()

}

// objet rouillé
function rustyObject() {

  return {
    type: "object",
    name: "Objet rouillé",
    text: "Vous trouvez un objet métallique rouillé sur le sol.",
    contaminatedChance: contaminationChance()
  }

}

// trousse médicale
function medicalKit() {

  return {
    type: "object",
    name: "Trousse médicale",
    text: "Une trousse médicale abandonnée.",
    heal: 20,
    contaminatedChance: contaminationChance() - 0.2
  }

}

// appareil électronique
function electronicDevice() {

  return {
    type: "object",
    name: "Appareil électronique",
    text: "Un appareil électronique clignote faiblement.",
    damage: 15,
    contaminatedChance: contaminationChance() + 0.1
  }

}

// pièce vide
function emptyRoom() {

  return {
    type: "empty",
    text: "La pièce est vide et silencieuse."
  }

}

// difficulté progressive
function contaminationChance() {

  let chance = 0.3 + (gameState.floor * 0.03)

  if (chance > 0.9) chance = 0.9

  return chance
}

// interaction avec un objet
export function useObject(event) {

  const contaminated = Math.random() < event.contaminatedChance

  if (contaminated) {

    const radiationGain = 10 + gameState.floor

    addRadiation(radiationGain)

    return "L'objet est contaminé ! Radiation +" + radiationGain
  }

  if (event.heal) {

    heal(event.heal)

    return "Vous utilisez la trousse médicale. Vie +" + event.heal
  }

  if (event.damage) {

    damage(event.damage)

    return "L'appareil explose ! Vie -" + event.damage
  }

  return "L'objet ne fait rien."

}

// jeter l'objet
export function discardObject() {

  return "Vous décidez de jeter l'objet."

}
