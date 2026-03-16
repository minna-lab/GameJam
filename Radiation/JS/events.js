import { gameState, damage, addRadiation, heal } from "./gameState.js"
import { getRandomItem } from "../data/items.js"

// Event generation
export function randomEvent() {

  const rand = Math.random()

  // Object generation
  if (rand < 0.85) {

    const item = getRandomItem()

    return {
      type: "object",
      name: item.nom,
      text: item.description,
      heal: item.heal || 0,
      damage: item.damage || 0,
      radiation: item.radiation || 0,
      contaminatedChance: item.contaminatedChance
        ? item.contaminatedChance(gameState.floor)
        : contaminationChance(),
      trapText: item.trapText,
      useText: item.useText
    }

  }

  return emptyRoom()
}

// Empty Room
function emptyRoom() {
  return {
    type: "empty",
    text: "La pièce est vide."
  }
}

// progressive difficulty
function contaminationChance() {

  let chance = 0.3 + (gameState.floor * 0.05)

  if (chance > 0.9) chance = 0.9

  return chance
}

// interaction with an object
export function useObject(event) {

  const contaminated = Math.random() < event.contaminatedChance

  // contaminated object
  if (contaminated) {

    const radiationGain = 10 + gameState.floor

    addRadiation(radiationGain)

    return event.trapText || "L'objet était contaminé ! Radiation +" + radiationGain
  }

  // reduce radiation
  if (event.radiation < 0) {

    addRadiation(event.radiation)

    return event.useText || "Radiation " + event.radiation
  }

  // heal
  if (event.heal > 0) {

    heal(event.heal)

    return event.useText || "Vie +" + event.heal
  }

  // damage
  if (event.damage > 0) {

    damage(event.damage)

    return event.useText || "Vie -" + event.damage
  }

  return event.useText || "Rien ne se passe."
}

// drop an object
export function discardObject() {
  return "Vous jetez l'objet."
}