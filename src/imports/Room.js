import * as THREE from "three";

export default class Room {
	constructor(textureLoader, onProgress) {
		const room_material = new THREE.MeshPhongMaterial({
			map: textureLoader.load( `textures/concrete.jpg`, () => {
				console.log(`Textura do cenário carregada`);
			}, onProgress),
			side: THREE.BackSide
		});
		const room_geometry = new THREE.BoxGeometry( 600, 600, 1000 );
		this.room = new THREE.Mesh( room_geometry, room_material );
		this.room.position.set(0,290,0);
		this.room.doubleSided = true;
		this.room.receiveShadow = true;

		return this.room;
	}
}
