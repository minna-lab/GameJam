// GLOBAL GAME STATE

// 🟢 This object stores the current state of the game.
// Every system (events, UI, player actions) reads or modifies this state.

export const gameState = {
  floor: 0,
  health: 100,
  radiation: 0,
  alive: true,
  gameOver: false
}

// FLOOR PROGRESSION

// 🟢 Called when the player enters a new room or goes upstairs.
export function nextFloor() {
  gameState.floor += 1
}


// DAMAGE SYSTEM

// 🟢 Reduces player health when something dangerous happens.
export function damage(amount) {

  gameState.health -= amount

  if (gameState.health < 0) {
    gameState.health = 0
  }

  checkDeath()
}


// RADIATION SYSTEM


// 🟢 Adds radiation when the player touches a contaminated object.
export function addRadiation(amount) {

  gameState.radiation += amount

  if (gameState.radiation > 100) {
    gameState.radiation = 100
  }

  checkDeath()
}


// HEAL SYSTEM


// 🟢 Used when the player finds medical items.
export function heal(amount) {

  gameState.health += amount

  if (gameState.health > 100) {
    gameState.health = 100
  }
}


// DEATH CHECK


// 🟢 This function verifies if the player died.
// Death happens if health reaches 0 or radiation reaches 100.

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


// 🟢 Used to restart the game.

export function resetGame() {

  gameState.floor = 0
  gameState.health = 100
  gameState.radiation = 0
  gameState.alive = true
  gameState.gameOver = false

}