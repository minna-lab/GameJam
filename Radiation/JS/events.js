// events.js

import { gameState, damage, addRadiation, heal } from "./gameState.js"
import { getRandomItem } from "../data/items.js" // 🔗 connexion avec items.js (Scénariste)

// générer un événement dans la pièce
export function randomEvent() {

  const rand = Math.random()

  // 🔗 on remplace rustyObject / medicalKit / electronicDevice
  // par les objets du fichier items.js du scénariste
  if (rand < 0.85) {
    const item = getRandomItem()
    return {
      type: "object",
      name: item.nom,
      text: item.description,
      heal: item.heal || 0,
      damage: item.damage || 0,
      radiation: item.radiation || 0,
      contaminatedChance: item.contaminatedChance(gameState.floor),
      trapText: item.trapText,
      useText: item.useText
    }
  }

  return emptyRoom()

}

// pièce vide — inchangé
function emptyRoom() {

  return {
    type: "empty",
    text: "La pièce est vide et silencieuse."
  }

}

// difficulté progressive — inchangé
function contaminationChance() {

  let chance = 0.3 + (gameState.floor * 0.03)

  if (chance > 0.9) chance = 0.9

  return chance
}

// interaction avec un objet — légèrement modifié pour afficher
// les textes narratifs du scénariste (trapText et useText)
export function useObject(event) {

  const contaminated = Math.random() < event.contaminatedChance

  // ☠ l'objet se retourne contre le joueur
  if (contaminated) {

    const radiationGain = 10 + gameState.floor

    addRadiation(radiationGain)

    // affiche le texte du piège si disponible, sinon texte par défaut
    return event.trapText || "L'objet est contaminé ! Radiation +" + radiationGain

  }

  // réduire la radiation (ex: capsules détox)
  if (event.radiation < 0) {

    addRadiation(event.radiation)

    return event.useText || "Vous utilisez l'objet. Radiation " + event.radiation

  }

  // soigner
  if (event.heal > 0) {

    heal(event.heal)

    return event.useText || "Vous utilisez la trousse médicale. Vie +" + event.heal

  }

  // dégâts
  if (event.damage > 0) {

    damage(event.damage)

    return event.useText || "L'appareil explose ! Vie -" + event.damage

  }

  return event.useText || "L'objet ne fait rien."

}

// jeter l'objet — inchangé
export function discardObject() {

  return "Vous décidez de jeter l'objet."

}
