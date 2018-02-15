import * as THREE from "three";

export default class Board {
	constructor(texture, x, y, z, textureLoader, onProgress, name = ``, scene) {
		textureLoader.load( `textures/${texture}.jpg`, texture => {
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			this.geometry = new THREE.BoxGeometry( 200, 200, 0);
			this.material = new THREE.MeshPhongMaterial({map:texture});
			this.board = new THREE.Mesh( this.geometry, this.material );
			this.board.position.set(x, y, z);
			this.board.rotateY( 270* Math.PI / 180 );
			this.board.receiveShadow = true;
			scene.add(this.board);
			console.log(`${name} board loaded.`);
		}, onProgress);

		return this.board;
	}
}
