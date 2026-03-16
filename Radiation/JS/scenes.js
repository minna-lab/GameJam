const BASE_SCENES = [
    {
        key: "reception",
        maxFloor: 1,
        image: "asset/images/image 1.png",
        danger: "Zone instable"
    },
    {
        key: "couloir",
        maxFloor: 3,
        image: "asset/images/image 2.png",
        danger: "Radiation moderee"
    },
    {
        key: "maintenance",
        maxFloor: 6,
        image: "asset/images/image 3.png",
        danger: "Radiation elevee"
    },
    {
        key: "laboratoire",
        maxFloor: Number.POSITIVE_INFINITY,
        image: "asset/images/image 4.png",
        danger: "Zone critique"
    }
]

export function getSceneByFloor(floor) {
    const safeFloor = Math.max(0, floor)
    return BASE_SCENES.find((scene) => safeFloor <= scene.maxFloor) || BASE_SCENES[0]
}

export function renderScene(sceneImageElement, dangerBadgeElement, scene) {
    if (!sceneImageElement || !dangerBadgeElement || !scene) return

    sceneImageElement.src = scene.image
    
    dangerBadgeElement.textContent = scene.danger
}