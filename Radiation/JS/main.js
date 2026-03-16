import { gameState, resetGame, nextFloor } from "./gameState.js"
import { randomEvent, useObject, discardObject } from "./events.js"
import { STORY, getFloorText } from "../data/story.js"
import { getSceneByFloor, renderScene } from "./scenes.js"
import { bindInteractionHandlers } from "./interactions.js"

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

function getItemVisual(event) {
  if (!event || event.type === "empty") {
    return {
      image: "asset/images/image 5.png",
      name: "Aucun objet",
      description: "Le silence de la piece est parfois plus inquietant qu'un piege visible."
    }
  }

  if (event.name === "Objet rouille") {
    return {
      image: "asset/images/image 2.png",
      name: "Objet rouille",
      description: "Un fragment metallique corrode. Utile peut-etre. Fatal surement."
    }
  }

  if (event.name === "Trousse medicale") {
    return {
      image: "asset/images/image 3.png",
      name: "Trousse medicale",
      description: "Une promesse de survie enfermee dans une boite vieillie par la contamination."
    }
  }

  if (event.name === "Appareil electronique") {
    return {
      image: "asset/images/image 4.png",
      name: "Appareil electronique",
      description: "Un vestige experimental encore traverse par un souffle electrique."
    }
  }

  return {
    image: "asset/images/image 5.png",
    name: event.name || "Objet inconnu",
    description: event.text || "Quelque chose attend dans la penombre."
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
  renderScene(sceneImage, dangerBadge, scene)
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
  const gameOverText = gameState.radiation >= 100 ? STORY.fin.radiation : STORY.fin.vie

  sceneText.innerHTML = `<span class="game-over-text">${gameOverText}</span>`
  sceneImage.src = "asset/images/image 5.png"
  itemImage.src = "asset/images/image 5.png"
  itemName.textContent = "Fin de partie"
  itemDescription.textContent = "Votre ascension s'arrete ici."

  exploreBtn.disabled = true
  useBtn.disabled = true
  discardBtn.disabled = true
  nextFloorBtn.disabled = true
  restartBtn.classList.remove("hidden")

  playSound(sfxGameOver)
  addLog("Fin de partie : votre corps cede sous les blessures ou la contamination.")
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

  sceneText.textContent = STORY.intro
  setItemCard(null)
  updateUI()
  addLog("Debut de partie : entree dans la tour.")

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

bindInteractionHandlers({
  gameState,
  buttons: {
    exploreBtn,
    useBtn,
    discardBtn,
    nextFloorBtn,
    restartBtn
  },
  sceneText,
  sounds: {
    sfxClick,
    sfxContamination,
    sfxHeal,
    sfxExplosion
  },

  dependencies: {
    randomEvent,
    useObject,
    discardObject,
    nextFloor,
    getFloorText
  },
  helpers: {
    playSound,
    addLog,
    setItemCard,
    updateUI,
    startNewGame
  },
  getCurrentEvent: () => currentEvent,
  setCurrentEvent: (event) => {
    currentEvent = event
  }
})

applyAudioSettings()
setItemCard(null)
updateUI()
showScreen("home")