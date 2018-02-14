import THREE from "three";

export default class Board {
	constructor(texture, textureLoader, onProgress, name = ``) {
		textureLoader.load( `textures/${texture}.jpg`, texture => {
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			const geometry = new THREE.BoxGeometry( 200, 200, 0);
			const material = new THREE.MeshPhongMaterial({map:texture});
			this.board = new THREE.Mesh( geometry, material );
			this.board.rotateY( 270* Math.PI / 180 );
			this.board.receiveShadow = true;
			console.log(`${name} board loaded.`);
		}, onProgress);

		return this.board;
	}

	setPosition(x, y, z) {
		this.board.position.set(x, y, z);
	}
}
