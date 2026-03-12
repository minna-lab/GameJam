import { gameState, nextFloor, resetGame } from "./gameState.js"
import { randomEvent, useObject, discardObject } from "./events.js"
import { STORY, getFloorText } from "../data/story.js" // 🔗 connexion avec story.js (Scénariste)

const homeScreen = document.getElementById("homeScreen")
const settingsScreen = document.getElementById("settingsScreen")
const gameScreen = document.getElementById("gameScreen")

const goGameFromHome = document.getElementById("goGameFromHome")
const goSettingsFromHome = document.getElementById("goSettingsFromHome")
const startGameBtn = document.getElementById("startGameBtn")
const openSettingsBtn = document.getElementById("openSettingsBtn")
const backHomeBtn = document.getElementById("backHomeBtn")
const startFromSettingsBtn = document.getElementById("startFromSettingsBtn")
const goSettingsFromGame = document.getElementById("goSettingsFromGame")
const quitToHomeBtn = document.getElementById("quitToHomeBtn")

const floorValue = document.getElementById("floorValue")
const healthBar = document.getElementById("healthBar")
const radiationBar = document.getElementById("radiationBar")
const healthValue = document.getElementById("healthValue")
const radiationValue = document.getElementById("radiationValue")

const sceneImage = document.getElementById("sceneImage")
const sceneText = document.getElementById("sceneText")
const dangerBadge = document.getElementById("dangerBadge")

const itemImage = document.getElementById("itemImage")
const itemName = document.getElementById("itemName")
const itemDescription = document.getElementById("itemDescription")

const exploreBtn = document.getElementById("exploreBtn")
const useBtn = document.getElementById("useBtn")
const discardBtn = document.getElementById("discardBtn")
const nextFloorBtn = document.getElementById("nextFloorBtn")
const restartBtn = document.getElementById("restartBtn")
const logList = document.getElementById("logList")

const musicToggle = document.getElementById("musicToggle")
const sfxToggle = document.getElementById("sfxToggle")
const musicVolume = document.getElementById("musicVolume")
const sfxVolume = document.getElementById("sfxVolume")

const bgAmbience = document.getElementById("bgAmbience")
const sfxClick = document.getElementById("sfxClick")
const sfxContamination = document.getElementById("sfxContamination")
const sfxHeal = document.getElementById("sfxHeal")
const sfxExplosion = document.getElementById("sfxExplosion")
const sfxGameOver = document.getElementById("sfxGameOver")

let currentEvent = null

function showScreen(screen) {
  homeScreen.classList.remove("active")
  settingsScreen.classList.remove("active")
  gameScreen.classList.remove("active")

  if (screen === "home") homeScreen.classList.add("active")
  if (screen === "settings") settingsScreen.classList.add("active")
  if (screen === "game") gameScreen.classList.add("active")
}

function applyAudioSettings() {
  bgAmbience.volume = Number(musicVolume.value)

  const effectsVolume = Number(sfxVolume.value)
  sfxClick.volume = effectsVolume
  sfxContamination.volume = effectsVolume
  sfxHeal.volume = effectsVolume
  sfxExplosion.volume = effectsVolume
  sfxGameOver.volume = effectsVolume

  if (!musicToggle.checked) {
    bgAmbience.pause()
  }
}

function playSound(sound) {
  if (!sfxToggle.checked || !sound) return
  sound.currentTime = 0
  sound.play().catch(() => {})
}

function startMusic() {
  if (!musicToggle.checked) return
  bgAmbience.play().catch(() => {})
}

function addLog(message) {
  const entry = document.createElement("div")
  entry.className = "log-entry"
  entry.textContent = message
  logList.prepend(entry)
}

function getSceneByFloor(floor) {
  if (floor <= 1) {
    return {
      image: "assets/images/hotel-lobby.jpg",
      danger: "Zone instable"
    }
  }

  if (floor <= 3) {
    return {
      image: "assets/images/hotel-corridor.jpg",
      danger: "Radiation modérée"
    }
  }

  if (floor <= 6) {
    return {
      image: "assets/images/lab-floor.jpg",
      danger: "Radiation élevée"
    }
  }

  return {
    image: "assets/images/reactor-floor.jpg",
    danger: "Zone critique"
  }
}

function getItemVisual(event) {
  if (!event || event.type === "empty") {
    return {
      image: "assets/images/item-shadow.png",
      name: "Aucun objet",
      description: "Le silence de la pièce est parfois plus inquiétant qu’un piège visible."
    }
  }

  if (event.name === "Objet rouillé") {
    return {
      image: "assets/images/rusty-object.png",
      name: "Objet rouillé",
      description: "Un fragment métallique corrodé. Utile peut-être. Fatal sûrement."
    }
  }

  if (event.name === "Trousse médicale") {
    return {
      image: "assets/images/medical-kit.png",
      name: "Trousse médicale",
      description: "Une promesse de survie enfermée dans une boîte vieillie par la contamination."
    }
  }

  if (event.name === "Appareil électronique") {
    return {
      image: "assets/images/electronic-device.png",
      name: "Appareil électronique",
      description: "Un vestige expérimental encore traversé par un souffle électrique."
    }
  }

  return {
    image: "assets/images/item-shadow.png",
    name: "Objet inconnu",
    description: "Quelque chose attend dans la pénombre."
  }
}

function setItemCard(event) {
  const visual = getItemVisual(event)
  itemImage.src = visual.image
  itemName.textContent = visual.name
  itemDescription.textContent = visual.description
}

function updateScene() {
  const scene = getSceneByFloor(gameState.floor)
  sceneImage.src = scene.image
  dangerBadge.textContent = scene.danger
}

function updateHUD() {
  floorValue.textContent = gameState.floor
  healthValue.textContent = `${gameState.health} / 100`
  radiationValue.textContent = `${gameState.radiation} / 100`

  healthBar.style.width = `${gameState.health}%`
  radiationBar.style.width = `${gameState.radiation}%`

  if (gameState.radiation >= 60) {
    radiationBar.classList.add("radiation-alert")
  } else {
    radiationBar.classList.remove("radiation-alert")
  }
}

function setGameOver() {
  sceneText.innerHTML = `<span class="game-over-text">Vous êtes morte. La tour garde ses réponses dans son ombre.</span>`
  sceneImage.src = "assets/images/game-over.jpg"
  itemImage.src = "assets/images/item-shadow.png"
  itemName.textContent = "Fin de partie"
  itemDescription.textContent = "Votre ascension s’arrête ici."

  exploreBtn.disabled = true
  useBtn.disabled = true
  discardBtn.disabled = true
  nextFloorBtn.disabled = true
  restartBtn.classList.remove("hidden")

  playSound(sfxGameOver)
  addLog("Fin de partie : votre corps cède sous les blessures ou la contamination.")
}

function updateUI() {
  updateHUD()
  updateScene()

  if (gameState.gameOver) {
    setGameOver()
  }
}

function startNewGame() {
  resetGame()
  currentEvent = null

  logList.innerHTML = ""
  restartBtn.classList.add("hidden")

  exploreBtn.disabled = false
  useBtn.disabled = true
  discardBtn.disabled = true
  nextFloorBtn.disabled = false

  sceneText.textContent = STORY.intro // 🔗 texte d'introduction depuis story.js
  setItemCard(null)
  updateUI()
  addLog("Début de partie : entrée dans la tour.")

  showScreen("game")
  startMusic()
}

goGameFromHome.addEventListener("click", () => {
  playSound(sfxClick)
  startNewGame()
})

startGameBtn.addEventListener("click", () => {
  playSound(sfxClick)
  startNewGame()
})

goSettingsFromHome.addEventListener("click", () => {
  playSound(sfxClick)
  showScreen("settings")
})

openSettingsBtn.addEventListener("click", () => {
  playSound(sfxClick)
  showScreen("settings")
})

backHomeBtn.addEventListener("click", () => {
  playSound(sfxClick)
  showScreen("home")
})

startFromSettingsBtn.addEventListener("click", () => {
  playSound(sfxClick)
  startNewGame()
})

goSettingsFromGame.addEventListener("click", () => {
  playSound(sfxClick)
  showScreen("settings")
})

quitToHomeBtn.addEventListener("click", () => {
  playSound(sfxClick)
  showScreen("home")
})

musicToggle.addEventListener("change", () => {
  if (musicToggle.checked) {
    bgAmbience.volume = Number(musicVolume.value)
    bgAmbience.play().catch(() => {})
  } else {
    bgAmbience.pause()
  }
})

sfxToggle.addEventListener("change", applyAudioSettings)
musicVolume.addEventListener("input", applyAudioSettings)
sfxVolume.addEventListener("input", applyAudioSettings)

exploreBtn.addEventListener("click", () => {
  if (gameState.gameOver) return

  playSound(sfxClick)

  currentEvent = randomEvent()
  sceneText.textContent = currentEvent.text
  sceneText.classList.add("glitch")
  setTimeout(() => sceneText.classList.remove("glitch"), 500)

  setItemCard(currentEvent)
  addLog(`Étage ${gameState.floor} : ${currentEvent.text}`)

  if (currentEvent.type === "object") {
    useBtn.disabled = false
    discardBtn.disabled = false
  } else {
    useBtn.disabled = true
    discardBtn.disabled = true
  }

  updateUI()
})

useBtn.addEventListener("click", () => {
  if (!currentEvent || gameState.gameOver) return

  playSound(sfxClick)

  const result = useObject(currentEvent)
  sceneText.textContent = result
  addLog(result)

  if (result.includes("contamin")) {
    playSound(sfxContamination)
  } else if (result.includes("Vie +")) {
    playSound(sfxHeal)
  } else if (result.includes("explose")) {
    playSound(sfxExplosion)
  }

  currentEvent = null
  useBtn.disabled = true
  discardBtn.disabled = true
  setItemCard(null)

  updateUI()
})

discardBtn.addEventListener("click", () => {
  if (!currentEvent || gameState.gameOver) return

  playSound(sfxClick)

  const result = discardObject()
  sceneText.textContent = result
  addLog(result)

  currentEvent = null
  useBtn.disabled = true
  discardBtn.disabled = true
  setItemCard(null)

  updateUI()
})

nextFloorBtn.addEventListener("click", () => {
  if (gameState.gameOver) return

  playSound(sfxClick)

  nextFloor()
  currentEvent = null
  sceneText.textContent = getFloorText(gameState.floor) // 🔗 texte de montée depuis story.js
  addLog(`Vous montez à l’étage ${gameState.floor}. Le danger augmente.`)

  useBtn.disabled = true
  discardBtn.disabled = true
  setItemCard(null)

  updateUI()
})

restartBtn.addEventListener("click", () => {
  playSound(sfxClick)
  startNewGame()
})

applyAudioSettings()
setItemCard(null)
updateUI()
showScreen("home")