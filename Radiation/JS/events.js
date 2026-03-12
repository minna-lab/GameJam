// events.js

import { gameState, damage, addRadiation, heal } from "./gameState.js"


// ===============================
// RANDOM EVENT GENERATOR
// ===============================

// 🟢 Called when the player enters a room.
// It randomly generates something in the environment.

export function randomEvent() {

  const rand = Math.random()

  if (rand < 0.3) return rustyObject()
  if (rand < 0.6) return medicalKit()
  if (rand < 0.85) return electronicDevice()

  return emptyRoom()

}


// ===============================
// OBJECT EVENTS
// ===============================

// 🟢 A random rusty object.

function rustyObject() {

  return {
    type: "object",
    name: "Rusty Object",
    text: "You find a rusty metallic object on the ground.",
    contaminatedChance: contaminationChance()
  }

}


// 🟢 A medical kit that can heal the player.

function medicalKit() {

  return {
    type: "object",
    name: "Medical Kit",
    text: "An abandoned medical kit lies on the floor.",
    heal: 20,
    contaminatedChance: contaminationChance() - 0.2
  }

}


// 🟢 A strange electronic device that might explode.

function electronicDevice() {

  return {
    type: "object",
    name: "Electronic Device",
    text: "A strange electronic device is blinking.",
    damage: 15,
    contaminatedChance: contaminationChance() + 0.1
  }

}


// ===============================
// EMPTY ROOM
// ===============================

// 🟢 Sometimes nothing happens.

function emptyRoom() {

  return {
    type: "empty",
    text: "The room is empty and silent."
  }

}


// ===============================
// DIFFICULTY SCALING
// ===============================

// 🟢 The higher the floor, the more likely objects are contaminated.

function contaminationChance() {

  let chance = 0.3 + (gameState.floor * 0.03)

  if (chance > 0.9) chance = 0.9

  return chance
}


// ===============================
// OBJECT INTERACTION
// ===============================

// 🟢 Called when the player decides to USE the object.

export function useObject(event) {

  const contaminated = Math.random() < event.contaminatedChance

  // If the object is contaminated → radiation damage

  if (contaminated) {

    const radiationGain = 10 + gameState.floor

    addRadiation(radiationGain)

    return "The object is contaminated! Radiation +" + radiationGain
  }


  // If the object heals the player

  if (event.heal) {

    heal(event.heal)

    return "You use the medical kit. Health +" + event.heal
  }


  // If the object causes damage

  if (event.damage) {

    damage(event.damage)

    return "The device explodes! Health -" + event.damage
  }


  return "Nothing happens."

}


// ===============================
// DISCARD OBJECT
// ===============================

// 🟢 Called when the player decides to throw the object away.

export function discardObject() {

  return "You throw the object away."

}
