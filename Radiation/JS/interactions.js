export function bindInteractionHandlers(config) {
	const {
		gameState,
		buttons,
		sceneText,
		sounds,
		dependencies,
		helpers,
		getCurrentEvent,
		setCurrentEvent
	} = config

	const {
		exploreBtn,
		useBtn,
		discardBtn,
		nextFloorBtn,
		restartBtn
	} = buttons

	const {
		sfxClick,
		sfxContamination,
		sfxHeal,
		sfxExplosion
	} = sounds

	const {
		randomEvent,
		useObject,
		discardObject,
		nextFloor,
		getFloorText
	} = dependencies

	const {
		playSound,
		addLog,
		setItemCard,
		updateUI,
		startNewGame
	} = helpers

	exploreBtn.addEventListener("click", () => {
		if (gameState.gameOver) return

		playSound(sfxClick)

		const event = randomEvent()
		setCurrentEvent(event)

		sceneText.textContent = event.text
		sceneText.classList.add("glitch")
		setTimeout(() => sceneText.classList.remove("glitch"), 500)

		setItemCard(event)
		addLog(`Etage ${gameState.floor} : ${event.text}`)

		const foundObject = event.type === "object"
		useBtn.disabled = !foundObject
		discardBtn.disabled = !foundObject

		updateUI()
	})

	useBtn.addEventListener("click", () => {
		const currentEvent = getCurrentEvent()
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

		setCurrentEvent(null)
		useBtn.disabled = true
		discardBtn.disabled = true
		setItemCard(null)

		updateUI()
	})

	discardBtn.addEventListener("click", () => {
		const currentEvent = getCurrentEvent()
		if (!currentEvent || gameState.gameOver) return

		playSound(sfxClick)

		const result = discardObject()
		sceneText.textContent = result
		addLog(result)

		setCurrentEvent(null)
		useBtn.disabled = true
		discardBtn.disabled = true
		setItemCard(null)

		updateUI()
	})

	nextFloorBtn.addEventListener("click", () => {
		if (gameState.gameOver) return

		playSound(sfxClick)

		const zoneRadiation = nextFloor()
		setCurrentEvent(null)
		sceneText.textContent = getFloorText(gameState.floor)
		addLog(`Vous montez a l'etage ${gameState.floor}. Le danger augmente.`)

		if (zoneRadiation > 0) {
			addLog(`Radiation de zone: +${zoneRadiation}. Total ${gameState.radiation}/100.`)
		}

		useBtn.disabled = true
		discardBtn.disabled = true
		setItemCard(null)

		updateUI()
	})

	restartBtn.addEventListener("click", () => {
		playSound(sfxClick)
		
		startNewGame()

	})
}