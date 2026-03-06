// gameState.js

export const gameState = {
  floor: 0,
  health: 100,
  radiation: 0,
  alive: true,
  gameOver: false
}

// monter d'étage
export function nextFloor() {
  gameState.floor += 1
}

// perdre de la vie
export function damage(amount) {
  gameState.health -= amount
  checkDeath()
}

// ajouter de la radiation
export function addRadiation(amount) {
  gameState.radiation += amount
  checkDeath()
}

// soigner
export function heal(amount) {
  gameState.health += amount

  if (gameState.health > 100) {
    gameState.health = 100
  }
}

// vérifier mort
export function checkDeath() {

  if (gameState.health <= 0) {
    gameState.alive = false
    gameState.gameOver = true
  }

  if (gameState.radiation >= 100) {
    gameState.alive = false
    gameState.gameOver = true
  }

}

// recommencer la partie
export function resetGame() {

  gameState.floor = 0
  gameState.health = 100
  gameState.radiation = 0
  gameState.alive = true
  gameState.gameOver = false

}

