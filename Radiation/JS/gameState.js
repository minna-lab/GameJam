
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

export function nextFloor() {

  gameState.floor += 1

  // Score
  gameState.score += 100
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
```
