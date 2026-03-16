
// GLOBAL GAME STATE

export const gameState = {
  floor: 0,
  health: 100,
  radiation: 0,


  alive: true,
  gameOver: false,


  score: 0,
  inventory: [],
  gameStarted: false
}


// FLOOR PROGRESSION

export function getZoneRadiation(floor) {
  if (floor <= 1) {
    return 2 // Faible
  }
  if (floor <= 3) {
    return 5 // Modérée
  }
  if (floor <= 6) {
    return 10 // Élevée
  }
  return 16 // Critique
}

export function nextFloor() {
  gameState.floor += 1

  // Score
  gameState.score += 100

  // Radiation de zone à l’entrée de l’étage
  const zoneRadiation = getZoneRadiation(gameState.floor)
  if (zoneRadiation > 0) {
    addRadiation(zoneRadiation)
  }

  return zoneRadiation
}


// DAMAGE SYSTEM

export function damage(amount) {

  gameState.health -= amount

  if (gameState.health < 0) {
    gameState.health = 0
  }

  checkDeath()
}


// RADIATION SYSTEM

export function addRadiation(amount) {

  gameState.radiation += amount

  if (gameState.radiation > 100) {
    gameState.radiation = 100
  }

  if (gameState.radiation < 0) {
    gameState.radiation = 0
  }

  checkDeath()
}

export function getAmbientLight() {
  // Plus la radiation est haute, plus l’éclairage de la scène baisse.
  // 0 = sombre, 1 = normal. On garde un minimum pour la lisibilité.
  const base = 1.0
  const reduction = (gameState.radiation / 100) * 0.80
  return Math.max(0.15, base - reduction)
}


// HEAL SYSTEM

export function heal(amount) {

  gameState.health += amount

  if (gameState.health > 100) {
    gameState.health = 100
  }
}


// DEATH CHECK

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


// GAME RESET

export function resetGame() {

  gameState.floor = 0
  gameState.health = 100
  gameState.radiation = 0
  gameState.alive = true
  gameState.gameOver = false

  gameState.score = 0
  gameState.inventory = []
  gameState.gameStarted = false
}