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
		useBtn,
		discardBtn,
		inventoryBtn,
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
		renderRoomItem,
		addToInventory,
		updateUI,
		startNewGame
	} = helpers



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
		} else if (result.includes("Vie -") || result.toLowerCase().includes("dégâts") || result.toLowerCase().includes("degats")) {
			playSound(sfxExplosion)
			flashDamageEffect()
		} else if (result.includes("explose")) {
			playSound(sfxExplosion)
		}

		setCurrentEvent(null)
		useBtn.disabled = true
		discardBtn.disabled = true
		inventoryBtn.disabled = true
		setItemCard(null)
		renderRoomItem(null)

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
		inventoryBtn.disabled = true
		setItemCard(null)
		renderRoomItem(null)

		updateUI()
	})

	inventoryBtn.addEventListener("click", () => {
		const currentEvent = getCurrentEvent()
		if (!currentEvent || gameState.gameOver) return

		playSound(sfxClick)

		const result = addToInventory(currentEvent)
		if (result) {
			sceneText.textContent = "Objet mis dans l'inventaire."
			addLog(`Inventaire: ${currentEvent.name} ajouté.`)
		} else {
			sceneText.textContent = "Echec de l'inventaire."
			addLog("Impossible d'ajouter à l'inventaire.")
		}

		setCurrentEvent(null)
		useBtn.disabled = true
		discardBtn.disabled = true
		inventoryBtn.disabled = true
		setItemCard(null)
		renderRoomItem(null)

		updateUI()
	})

	nextFloorBtn.addEventListener("click", () => {
		if (gameState.gameOver) return

		playSound(sfxClick)

		const zoneRadiation = nextFloor()
		const nextItem = randomEvent()
		setCurrentEvent(nextItem)

		sceneText.textContent = getFloorText(gameState.floor)
		addLog(`Vous montez a l'etage ${gameState.floor}. Le danger augmente.`)
		addLog(`Radiation de zone: +${zoneRadiation}. Total ${gameState.radiation}/100.`)

		useBtn.disabled = true
		discardBtn.disabled = true
		inventoryBtn.disabled = true
		setItemCard(nextItem)
		renderRoomItem(nextItem)

		updateUI()
	})

	restartBtn.addEventListener("click", () => {
		playSound(sfxClick)
		
		startNewGame()

	})
}